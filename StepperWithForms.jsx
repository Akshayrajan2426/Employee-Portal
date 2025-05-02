import React, { useState, useContext } from 'react';
import { Steps, Button, Popconfirm, Collapse } from 'antd';
import axios from 'axios';
import DynamicForm from './DynamicForm';
import { AuthContext } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import { CloseOutlined } from '@ant-design/icons';

const { Step } = Steps;
const { Panel } = Collapse;

const StepperWithForms = ({
  config = {
    steps: [
      {
        stepId: 'step1',
        tableName: 'projects',
        label: 'Create Project',
        allowRepeat: false,
        carryForward: [] 
      },
      {
        stepId: 'step2',
        tableName: 'projecttasks',
        label: 'Create Tasks',
        allowRepeat: true,
        carryForward: [
          { from: 'projects', fromField: '_id', to: 'projecttasks', toField: 'project' },
        ]
      },
      {
        stepId: 'step3',
        tableName: 'projectallocations',
        label: 'Create Allocations',
        allowRepeat: true,
        carryForward: [
          { from: 'projects', fromField: '_id', to: 'projectallocations', toField: 'project' }
        ]
      },
    ],
  },
}) => {
  const [activeStep, setActiveStep] = useState(0);
  const [formInstances, setFormInstances] = useState(
    config.steps.reduce((acc, step) => {
      acc[step.stepId] = [{ id: `form-${step.stepId}-0` }];
      return acc;
    }, {})
  );
  const [formData, setFormData] = useState({});
  const { token, defaultToken } = useContext(AuthContext);

  const handleFormSubmit = ({ formId, tableName, data }) => {
    setFormData((prev) => ({
      ...prev,
      [tableName]: {
        ...(prev[tableName] || {}),
        [formId]: data,
      },
    }));
    // toast.success(`Form ${formId} submitted successfully!`);
  };

  const handleAddForm = (stepId) => {
    setFormInstances((prev) => ({
      ...prev,
      [stepId]: [
        ...prev[stepId],
        { id: `form-${stepId}-${prev[stepId].length}` },
      ],
    }));
  };

  const handleRemoveForm = async (stepId, formId) => {
    const tableName = config.steps.find(step => step.stepId === stepId).tableName;
    const formRecord = formData[tableName]?.[formId];

    if (formRecord?._id) {
      try {
        const response = await axios.delete(
          `${import.meta.env.VITE_API_URI}/api/dynamic/${tableName}/${formRecord._id}`,
          {
            headers: { Authorization: `Bearer ${defaultToken}` },
          }
        );
        console.log('Form deleted successfully:', response);
        toast.success(`Form ${formId} deleted successfully!`);
      } catch (error) {
        console.error('Error deleting form:', error);
        // toast.error('Failed to delete form. Please try again.');
        return; // Exit early if deletion fails
      }
    }

    setFormInstances((prev) => {
      const updatedInstances = {
        ...prev,
        [stepId]: prev[stepId].filter((instance) => instance.id !== formId),
      };
      if (updatedInstances[stepId].length === 0) {
        updatedInstances[stepId] = [{ id: `form-${stepId}-0` }];
      }
      return updatedInstances;
    });

    setFormData((prev) => {
      const updatedData = { ...prev };
      if (updatedData[tableName]) {
        delete updatedData[tableName][formId];
      }
      return updatedData;
    });

    toast.success(`Form removed!`);
  };

  const generateInitialValues = (stepId, formId) => {
    const step = config.steps.find(s => s.stepId === stepId);
    const tableName = step.tableName;
    let initialValues = formData[tableName]?.[formId] || {};
    
    // Only carry forward explicitly defined fields
    if (step.carryForward && step.carryForward.length > 0) {
      step.carryForward.forEach(cf => {
        const sourceTableData = formData[cf.from];
        if (sourceTableData) {
          const sourceFormId = Object.keys(sourceTableData)[0];
          if (sourceFormId && sourceTableData[sourceFormId] && sourceTableData[sourceFormId][cf.fromField] !== undefined) {
            // Only carry forward if the field is explicitly listed in carryForward config
            initialValues = {
              ...initialValues,
              [cf.toField]: sourceTableData[sourceFormId][cf.fromField]
            };
          }
        }
      });
    }
    
    return initialValues;
  };

  const handleNext = async () => {
    const currentStepId = config.steps[activeStep].stepId;
    const forms = formInstances[currentStepId];
    const allSubmitted = forms.every((instance) =>
      formData[config.steps[activeStep].tableName]?.[instance.id]
    );

    if (!allSubmitted) {
      toast.error('Please submit all forms in this step.');
      return;
    }

    if (activeStep === config.steps.length - 1) {
      handleComplete(formData);
    } else {
      setActiveStep((prev) => prev + 1);
    }
  };

  const handlePrevious = () => {
    setActiveStep((prev) => Math.max(prev - 1, 0));
  };

  const handleComplete = (data) => {
    console.log('Final Submission:', data);
    const formattedData = Object.keys(data).reduce((acc, tableName) => {
      acc[tableName] = Object.values(data[tableName]);
      return acc;
    }, {});
    console.log('Formatted for API:', formattedData);
    // toast.success('All steps completed!');
  };

  const currentStep = config.steps[activeStep];

  return (
    <div style={{ maxWidth: '1200px', margin: 'auto', padding: '20px' }}>
      <Steps current={activeStep}>
        {config.steps.map((step) => (
          <Step key={step.stepId} title={step.label} />
        ))}
      </Steps>

      <div style={{ marginTop: '20px' }}>
        <Collapse defaultActiveKey={formInstances[currentStep.stepId].map((_, i) => i.toString())}>
          {formInstances[currentStep.stepId].map((instance, index) => {
            const initialValues = generateInitialValues(currentStep.stepId, instance.id);
            const action = initialValues._id ? 'update' : 'create';

            return (
              <Panel
                key={index}
                header={`Form ${index + 1}`}
                extra={
                  currentStep.allowRepeat && formInstances[currentStep.stepId].length > 1 ? (
                    <Button
                      type="link"
                      danger
                      icon={<CloseOutlined />}
                      onClick={(e) => {
                        e.stopPropagation(); // Prevent collapse toggle
                        handleRemoveForm(currentStep.stepId, instance.id);
                      }}
                    />
                  ) : null
                }
              >
                <div style={{ padding: '15px' }}>
                  <DynamicForm
                    formId={instance.id}
                    tableName={currentStep.tableName}
                    onSubmit={handleFormSubmit}
                    propRendering={true}
                    stepper={true}
                    totalSteps={config.steps.length}
                    initialValues={initialValues}
                    action={action}
                  />
                </div>
              </Panel>
            );
          })}
        </Collapse>

        {currentStep.allowRepeat && (
          <Button
            type="dashed"
            onClick={() => handleAddForm(currentStep.stepId)}
            style={{ marginTop: '10px' }}
          >
            + Add Another
          </Button>
        )}
      </div>

      <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'space-between' }}>
        <Button disabled={activeStep === 0} onClick={handlePrevious}>
          Previous
        </Button>
        <Popconfirm
          title="Proceed to next step?"
          description="Ensure all forms are submitted."
          onConfirm={handleNext}
        >
          <Button type="primary">
            {activeStep === config.steps.length - 1 ? 'Finish' : 'Next'}
          </Button>
        </Popconfirm>
      </div>

      {/* <pre style={{ marginTop: '20px' }}>{JSON.stringify(formData, null, 2)}</pre> */}
    </div>
  );
};

export default StepperWithForms;