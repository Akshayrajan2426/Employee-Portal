import React, { useContext, useEffect, useState, useMemo, useRef } from 'react';
import { Form, Input, InputNumber, Descriptions, Select, Checkbox, Card, Row, Col, Button, Spin, Typography, Steps, DatePicker, Divider, Popconfirm, Rate, Upload, Tabs, Segmented, TimePicker, Empty, Space, Drawer, FloatButton, Dropdown, Switch, ColorPicker, Alert } from 'antd';
import { CircularProgress, Grid } from '@mui/material';
import { motion } from 'framer-motion';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Link, useNavigate, useParams } from 'react-router-dom';
import './DynamicForm.css'
import PermissionPicker from '../PermissionPicker/PermissionPicker';
import RolePicker from '../RolePicker/RolePicker';
import { SplitupTable } from '../SplitupTable/SplitupTable';
import dayjs from 'dayjs';
import { AuthContext } from '../../context/AuthContext';
import NotFoundPage from '../../pages/NotFoundPage/NotFoundPage';
import Stepper from '../Stepper/Stepper';
import MultiSelectPicker from '../MultiSelectPicker/MultiSelectPicker';
import { camelCaseToNormal } from '../../utils/StringTransformation';
import { MailOutlined, PhoneOutlined, UserOutlined, UploadOutlined, CustomerServiceOutlined, HistoryOutlined, InboxOutlined, CarryOutOutlined, SettingFilled, ControlOutlined, ControlFilled, BackwardFilled, SaveFilled, MoreOutlined, DownOutlined, InfoCircleOutlined } from '@ant-design/icons';
import isoWeek from 'dayjs/plugin/isoWeek';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import moment from 'moment';
import AntDButton from "antd/lib/button";
import Chat from '../Chat/chat';
import ApprovalChainBuilder from '../ApprovalStep/ApprovalStep';
import { ds } from "../DotObject/DotObject";
import RelatedLists from '../RelatedLists/RelatedLists';
import SlabContainer from '../Slab/SlabContainer';
import CTCBreakdown from "../CtcCalculation/CtcCalculation";
import StepperTimeline from '../StepperNew/StepperNew';
import WeeklyOffTable from '../WeeklyOffTable/WeeklyOffTable';
import CodeEditor from '../CodeEditor/CodeEditor';
import ActivityCard from '../../pages/History/ActivityCard';
import Paragraph from 'antd/es/skeleton/Paragraph';
import ProjectAllocation from '../ProjectAllocation/ProjectAllocation';
import KeyValuepair from '../KeyValuepair/KeyValuepair';
import DND from '../DND/DND';
import AutoCompleteReference from '../AutoCompleteReference/AutoCompleteReference';
import RelatedLinks from '../RelatedLinks/RelatedLinks';
import CustomSlab from '../CustomSlab/CustomSlab';

dayjs.extend(isoWeek);
dayjs.extend(customParseFormat);

const { Option } = Select;
const { Title, Text } = Typography;
const { Step } = Steps;
const { TabPane } = Tabs;



const DynamicForm = ({ onboarding, isUpdate, employeeId, propRendering = false, tableName = null, objectId = null, onSubmit, currentStep, totalSteps, onPrevious, userProfile, setFormInstance, onNextStep, isView, isModal, handleClose, formId, stepper = false, initialValues = {}, action }) => {
  //const location = useLocation(); // Access the location object
  const [form] = Form.useForm();
  const [formData, setFormData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [formLoading, setFormLoading] = useState(true);
  const [alertMessage, setAlertMessage] = useState(null);
  // sample alertMessage value = {"description" : "this is a test message" , "title" : "hi", "type" : "success"}
  const [formValues, setFormValues] = useState(initialValues)
  const [savedData, setSavedData] = useState({});
  const [isSubmitDisabled, setIsSubmitDisabled] = useState(false);
  const [thisCanEdit, setCanEdit] = useState(false);
  const [isSubmitEnabled, setIsSubmitEnabled] = useState(false);
  const navigate = useNavigate()
  var table;
  var id;
  if (propRendering == true) {
    table = tableName
    if (isUpdate || isView) {
      id = objectId
    }
  }
  else {
    var { table, id } = useParams()
  }

  const [permissionsList, setPermissionsList] = useState([])
  const [lastChangedField, setLastChangedField] = useState(null);
  const [roleList, setRoleList] = useState([])
  const [splitUpData, setSplitUpData] = useState(null)
  const [splitUpDataKey, setSplitUpDataKey] = useState(null)
  const [multipleSelectKey, setMultipleSelectKey] = useState(null)
  const [count, setCount] = useState(0)
  const [refOptions, setRefOptions] = useState({})
  const [isLoading, setIsLoading] = useState(false)
  const { globalRoles, globalPermissions, token, defaultToken, formDisplayName, user } = useContext(AuthContext)
  const fullWidthFields = ['splituptable', 'permissionpicker']
  const [onLoad, setOnLoad] = useState(true)
  const [mappedFormData, setMappedFormData] = useState(null)
  const [tempFormData, setTempFormData] = useState(null)
  const [Mandatorydata, setMandatorydata] = useState(null)
  const [feedbackData, setFeedbackData] = useState({})
  const [dataFromChild, setDataFromChild] = useState(null);
  // console.log("uer", userProfile);
  const [canCreate, setCanCreate] = useState(false)
  const [canRead, setCanRead] = useState(false)
  const [canUpdate, setCanUpdate] = useState(false)
  const [status, setStatus] = useState(null)
  const [formView, setFormView] = useState([])
  const [disabledEdit, setDisabledEdit] = useState(false)
  const [clientscript, setClientScript] = useState(null)
  const [isReportingManager, setIsReportingManager] = useState(false);
  const [disableAll, setDisableAll] = useState(false)
  const [cannotCreateDirectly, setCannotCreateDirectly] = useState(false)
  const [usernames, setUsernames] = useState([]);
  const [isMobile, setIsMobile] = useState(window?.innerWidth < 768);
  const [MultiSelectList, setMultiSelectList] = useState([])
  const [stepperData, setStepperData] = useState(null)
  const [activeTab, setActiveTab] = useState(null);
  const [projectData, setProjectData] = useState([]);
  const [currentStatus, setCurrentStatus] = useState('');
  const [costCentreNames, setCostCentreNames] = useState([]);
  const [formsResubmission, setFormResubmission] = useState(false);
  const [approvalChainList, setApprovalChainList] = useState([]);
  const [approvalChainKey, setApprovalChainKey] = useState(null);
  const [MultiSelectListAPI, setMultiSelectListAPI] = useState([])
  const [multipleSelectKeyAPI, setMultipleSelectKeyAPI] = useState([])
  const [chatHistory, setChatHistory] = useState([])
  const [optimizedData, setOptimizedData] = useState({})

  const [ctcBreakdownData, setCtcBreakdownData] = useState([]);
  const [timelineEntries, setTimelineEntries] = useState([]);
  const [timelineData, setTimelineData] = useState({
    workexperience: [],
    educationdetails: [],
    projecthistory: []
  });
  const [updateId, setUpdateId] = useState(id);
  const [history, setHistory] = useState(null);
  const [userProfileData, setUserProfileData] = useState(null);
  const [weeklyOffDays, setWeeklyOffDays] = useState({});
  const [projectAllocations, setProjectAllocations] = useState([]);
  const [keyValuepair, setKeyValuePair] = useState([]);
  const [drawerSpinner, setDrawerSpinner] = useState(false);
  const buttonRef = useRef(null);
  const [customProperty, getCustomProperty] = useState(null);

  const [canSubmit, setCanSubmit] = useState(true);
  const [open, setOpen] = useState(false);
  const [placement, setPlacement] = useState('right');
  const [onLoadScript, setOnLoadScript] = useState(null);
  const [onSubmitScript, setOnSubmitScript] = useState(null);
  const [addableOptions, setAddableOptions] = useState([]);
  const [searchTerm, setSearchTerm] = useState([]);
  const [refOptionsClone, setRefOptionsClone] = useState({})


  let items = [
    (isUpdate && (globalPermissions?.includes(`${formData?.tableName}.update`)) && {
      label: <Link onClick={() => handleSubmit(true, form.getFieldsValue())}>Save</Link>,
      key: '1',
      icon: <SaveFilled />
    }),

    ...(globalPermissions?.includes(`forms.create`)
      ? [
        {
          label: <Link to={`/forms/${formData?._id}`}>Configure Form</Link>,
          key: '2',
          icon: <SettingFilled />
        },
      ]
      : []
    ), {
      label: <Link onClick={() => handleBackButtonClick()}>Back</Link>,
      key: '3',
      icon: <BackwardFilled />
    },
  ];
  if (isModal) {
    items = [];
  }

  const showDrawer = async () => {
    setOpen(true);

    const fetchHistory = async () => {
      const apiUri = import.meta.env.VITE_API_URI; // Extract API URI
      try {
        const response = await axios.get(`${apiUri}/api/dynamic/history?reference=${id}`, {
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });
        console.log("History", response?.data?.data);
        setHistory(response?.data?.data || []);
      } catch (e) {
        console.error("Error fetching History:", e);
        setHistory([]); // Set empty array on error
      }
    };

    const fetchUserProfile = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_API_URI}/api/dynamic/users?requiredfields=name,profilePicture`, {
          headers: {
            "Authorization": `Bearer ${defaultToken}`
          }
        }
        );
        console.log("User", response.data.data)
        const data = response.data.data;
        setUserProfileData(data);
      } catch (error) {
        setUserProfileData([]);
        console.error("Error fetching activity stream:", error);
      }
    };

    setDrawerSpinner(true); // Start showing spinner

    try {
      await fetchHistory();
      await fetchUserProfile();
    } finally {
      setDrawerSpinner(false); // Hide spinner when done (success or error)
    }


  };
  const onClose = () => {
    setOpen(false);
  };
  const onChange = (e) => {

    setPlacement(e.target.value);
  };

  // Add the handler function
  const handleTimelineChange = (tableName, data) => {
    setTimelineData(prev => ({
      ...prev,
      [tableName]: data
    }));

    // Update form values
    form.setFieldsValue({
      [tableName]: data
    });
  };
  // useEffect(() => {
  //   console.log("Form Field Values on Load:", form.getFieldsValue());
  // }, [form]);
  // useEffect(() => {
  //   if (isUpdate && formValues) {
  //     console.log("Setting form values:", formValues);
  //     form.setFieldsValue(formValues);
  //   }
  // }, [isUpdate, formValues, form]);
  // Inside DynamicForm component
  useEffect(() => {
    console.log("Employee ID:", employeeId); // Debugging
    if (employeeId && currentStep > 0) {
      console.log("Setting employeeId in form");
      form.setFieldsValue({ employeeId: employeeId });
    }
  }, [employeeId, form, currentStep]);


  // useEffect(() => {
  //     console.log("Triggering portal logic for candidate form...");
  //     executeClientScript("portal");

  //     if (Object.keys(optimizedData).includes("portal")) {
  //       relationshipVisibility();
  //     }

  //     //portalLogicExecuted.current = true; // Mark portal logic as executed
  // }, [optimizedData, refOptionsClone, refOptions]);

  // Set default tab when data is available
  useEffect(() => {
    if (mappedFormData?.length > 0) {
      setActiveTab(mappedFormData[0].section); // Default to the first section
    }
  }, [mappedFormData]);

  const [dynamicCount, setDynamicCount] = useState(0)

  useEffect(() => {
    if (setFormInstance) {
      setFormInstance(form);
    }
  }, [form, setFormInstance]);

  // Fetch the project collection data when the field is "current status"

  useEffect(() => {
    fetchProjectAllocations(); // Call the function to fetch project allocations when component loads
  }, [user]); // Make sure this effect runs whenever the user changes

  useEffect(() => {
    form.resetFields(); // Reset form fields when formData changes
    form.setFieldsValue(initialValues);
  }, [initialValues]);


  const fetchProjectAllocations = async () => {
    const apiUri = import.meta.env.VITE_API_URI; // Extract API URI
    try {
      const tokenToBeTaken = token; // Use token from context

      // Make the API request to fetch project allocations
      const response = await axios.get(`${apiUri}/api/dynamic/projectallocations`, {
        headers: {
          "Authorization": `Bearer ${tokenToBeTaken}`
        }
      });

      console.log('Project Allocations Response:', response.data.data);

      const projectData = response?.data?.data || []; // Ensure the response data is an array
      console.log("Project Data:", projectData);

      // Filter project data based on user ID
      const userProjects = projectData.filter((project) => {
        console.log("Checking project:", project);
        return project.allocatedTo && project.allocatedTo.includes(user._id); // Filter based on allocatedTo field
      });

      console.log("Filtered User Projects:", userProjects);

      // Set project data and current status based on filtered user projects
      if (userProjects.length > 0) {
        setProjectData(userProjects.map((project) => project.projectName));
        setCurrentStatus(userProjects[0].projectName); // Default project as current status

        // Extract costcentre IDs from the filtered user projects
        const costCentreIds = userProjects.map(project => project.costcentre).filter(Boolean); // Filter out any null or undefined costcentre IDs
        console.log("Cost Centre IDs:", costCentreIds);

        // Fetch cost centre names using the extracted costcentre IDs
        fetchCostCentres(costCentreIds, tokenToBeTaken); // Pass costcentre IDs to the next function
      } else {
        setProjectData(['Business Wait']);
        setCurrentStatus('Business Wait');
        setCostCentreNames(['No Cost Centre Found']); // Default if no projects allocated
      }
    } catch (error) {
      console.error('Error fetching project allocations:', error);
      setProjectData(['Business Wait']);
      setCurrentStatus('Business Wait');
      setCostCentreNames(['No Cost Centre Found']);
    } finally {
      setLoading(false); // Set loading to false once the request completes
    }
  };

  // Function to fetch cost centre data based on costcentre IDs
  const fetchCostCentres = async (costCentreIds, token) => {
    const apiUri = import.meta.env.VITE_API_URI; // Extract API URI
    try {
      // Fetch cost centre details for each costcentre ID
      const costCentreResponses = await Promise.all(costCentreIds.map(async (costCentreId) => {
        const costCentreResponse = await axios.get(`${apiUri}/api/dynamic/costcentre/${costCentreId}`, {
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });
        return costCentreResponse.data.name; // Assuming the response contains the cost centre name
      }));

      console.log("Cost Centre Names:", costCentreResponses);
      setCostCentreNames(costCentreResponses); // Store cost centre names in state
    } catch (error) {
      console.error('Error fetching cost centres:', error);
      setCostCentreNames(['Error fetching cost centres']);
    }
  };

  // Memoized version of current status field rendering
  const renderCurrentStatusField = (field) => {
    return (
      <Form.Item label="Current Status">
        <span>{loading ? "Loading..." : currentStatus}</span>
      </Form.Item>
    );
  };

  // Render the cost centre field without memoization
  const renderCostCentreField = (field) => {
    return (
      <Form.Item label="Cost Centre">
        <span>{loading ? "Loading..." : (costCentreNames.length > 0 ? costCentreNames.join(", ") : "No Cost Centre Found")}</span>
      </Form.Item>
    );
  };

  // useEffect(() => {
  //   // Check if portal value exists in localStorage
  //   const portalValue = localStorage.getItem('portal');
  //   if (portalValue) {
  //     // Update the form's portal field
  //     console.log("PORTAL VALUE:----------->",portalValue);
  //     form.setFieldsValue({ portal: portalValue });

  //     // Trigger any onChange logic for the portal field
  //     formValuesOnChange({ portal: portalValue }, { ...form.getFieldsValue(), portal: portalValue });

  //     // Clear the portal value from localStorage after use
  //     localStorage.removeItem('portal');
  //   }
  // }, [form]);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const statusButtonMapping = {
    loading: 'Change Conveyor',
    awaitingLoading: 'Start Count',
  }

  useEffect(() => {

    const entity = table;

    const hasCreatePermission = globalPermissions.includes(`${entity}.create`);
    const hasReadPermission = globalPermissions.includes(`${entity}.read`);
    const hasUpdatePermission = globalPermissions.includes(`${entity}.update`);
    const hasDisabledEditPermission = globalPermissions.includes(`${entity}.disabledEdit`);

    setCanCreate(hasCreatePermission);
    setCanRead(hasReadPermission);
    setCanUpdate(hasUpdatePermission)
    setDisabledEdit(hasDisabledEditPermission)


    const fetchFormData = async () => {
      const apiUri = import.meta.env.VITE_API_URI; // Extract API URI
      try {
        setFormLoading(true); // Start loading spinner
        const tokenToBeTaken = userProfile ? defaultToken : token
        const response = await axios.get(`${import.meta.env.VITE_API_URI}/api/data/formdata/${table}/${id}`, {
          headers: {
            "Authorization": `Bearer ${defaultToken}`
          }
        });
        let formDataTemp = response.data.formData
        let formValueTemp = response.data.data
        setStepperData(response.data.data)
        setCannotCreateDirectly(formDataTemp?.cannotSubmitDirectly);
        console.log()

        let statusTemp = response.data?.data?.status;
        isUpdate && setFormValues(formValueTemp);
        setChatHistory(formValueTemp?.chatHistory)
        setWeeklyOffDays(formValueTemp?.weeklyOffDays);
        setKeyValuePair(formValueTemp?.keyValuepair);
        setProjectAllocations(formValueTemp?.projectAllocations);
        setSearchTerm(formValueTemp?.searchTerm);
        setStatus(statusTemp)
        if (formDataTemp?.tableName == 'master') {
          formDataTemp = {
            ...formDataTemp,
            fields: formDataTemp.fields?.filter(field => field?.statusToVisible?.includes(statusTemp))
          }
        }
        if (userProfile && table !== "employees") {
          const profileResponse = await axios.get(`${import.meta.env.VITE_API_URI}/api/dynamic/${table}?employeeId=${id}`, {
            headers: {
              "Authorization": `Bearer ${defaultToken}`
            }
          });
          console.log("profile", profileResponse?.data.data)
          isUpdate && setFormValues(profileResponse?.data?.data[0] || []);
          setUpdateId(profileResponse?.data?.data[0]?._id);

        }
        // }

        // console.log('2nd-->',formDataTemp, statusTemp);
        // console.log(globalRoles, formDataTemp.fields.filter(field => field.formView && (globalRoles.some(element => field.rolesToVisible.includes(element)))));

        const fields = formDataTemp.fields.filter(field => {
          if (!field.formView) return false; // Ensure field has formView

          if (!isUpdate && field.formViewOnlyOnUpdate) return false; // If in update mode, show only fields with formViewOnUpdate

          if (!isUpdate && field.type == "autoincrement") return false; // If in create mode, show only fields with formViewOnCreate
          // if(!field.formViewOnSubmit)   return false; // If in submit mode, show only fields with formViewOnSubmit

          // Check for onlyVisibleToSelf condition
          if (field?.onlyVisibleToSelf) {
            if (user?._id === formValueTemp?._id) {
              return true; // Visible only if user and formValueTemp exist
            }
            return false; // Otherwise, hide the field
          }

          // Check for role-based visibility
          return ((globalRoles.some(element => field.rolesToVisible.includes(element))) || field.rolesToVisible.length === 0);
        });
        console.log("fields", fields);

        setFormData({ ...formDataTemp, fields });
        console.log('last-->', formDataTemp);

        setOnLoadScript(formDataTemp.onLoadScript || null);

        formValueTemp?.roles && setRoleList(formValueTemp.roles)
        formValueTemp?.permissions && setPermissionsList(formValueTemp.permissions.split(','))
        setOnSubmitScript(formDataTemp.onSubmitScript || null);

        if (response.data.formData && response.data.formData.clientScript) {
          try {
            setClientScript(response.data.formData.clientScript)
            // const script = new Function(response.data.formData.clientScript);
            // script()
          } catch (error) {
            console.error('Error executing client script:', error);
          }
        }

        const addablePromises = fields
          .filter(field => field.type === 'addableReference')
          .map(async (field) => {
            try {
              // console.log("Table-->", table);
              const url = `${apiUri}/api/data/${field.refTableName}`;
              const res = await axios.get(url, {
                headers: {
                  "Authorization": `Bearer ${defaultToken}`
                }
              });
              const extractUniqueSkills = (data, refValueField) => {
                return Array.from(new Set(data.map(item => item[refValueField])));
              };
              const opt = extractUniqueSkills(res?.data?.data, field?.refValueField);
              // Filter out elements in `opt` that are already in `addableOptions`
              const newOptions = [...addableOptions, ...opt.filter(item => !addableOptions.includes(item))];

              console.log("addableOptions", newOptions);
              setAddableOptions(newOptions);


            } catch (err) {
              console.error(`Error fetching reference data for ${field.refTableName}:`, err);
              return { [field.key]: [] }; // Return empty array if error
            }
          });

        const refPromises = fields
          .filter(field => field.type === 'reference')
          .map(async (field) => {
            try {
              // console.log("Table-->", table);
              const url =
                table === "employeeGoals"
                  ? `${apiUri}/api/data/goals/users/${user._id}` // Replace currentUserId with actual user ID
                  : `${apiUri}/api/data/${field.refTableName}`;
              const res = await axios.get(url, {
                headers: {
                  "Authorization": `Bearer ${defaultToken}`
                }
              });
              return { [field.key]: res.data.data }; // Return the result in key-value format
            } catch (err) {
              console.error(`Error fetching reference data for ${field.refTableName}:`, err);
              return { [field.key]: [] }; // Return empty array if error
            }
          });

        // Wait for all reference data to be fetched
        const refResults = await Promise.all(refPromises);
        const newRefOptions = refResults.reduce((acc, curr) => ({ ...acc, ...curr }), {});
        setRefOptions(prevState => ({ ...prevState, ...newRefOptions })); // Batch state update
        setRefOptionsClone(prevState => ({ ...prevState, ...newRefOptions })) // Clone the reference options;
      } catch (error) {
        console.error('Error fetching form data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFormData();
    !isUpdate && (setStatus('weighbridgeIn'))
  }, [table, isUpdate]);


  useEffect(() => {

  }, [roleList])

  useState(() => {

  }), [status]

  const createRecord = (values, isSave) => {
    axios.post(`${import.meta.env.VITE_API_URI}/api/dynamic/${table}`, values, {
      headers: {
        "Authorization": `Bearer ${token}`
      }
    }).then(res => {
      toast.success(`${res.data.message}`)
      if (stepper) {
        values._id = res.data.data.insertedId;;

        console.log("values", values);
        onSubmit({ formId, tableName: table, data: values });
        // setIsLoading(false);
      }
      if (!isSave) {
        if (isModal) {
          handleClose();
        } else {
          if (!stepper) {
            navigate(-1)
          }
        }
      }
    }).catch(rej => {
      console.error(rej);
      toast.error(rej.message)
    }).finally(() => {
      setIsLoading(false)
    })
  }

  useEffect(() => {
    console.log("Simulating $(document).ready() in React...");

    // Execute your initialization logic here
    if (onLoadScript) {
      console.log("Executing onLoadScript...");
      executeOnLoadScript();
    }
  }, []);

  const updateRecord = (values, isSave) => {
    let id =updateId;
    if (stepper) {
      console.log("valuesup", initialValues);
      id = initialValues._id;
      values._id = id;
      onSubmit({ formId, tableName: table, data: values });
    }
    axios.put(`${import.meta.env.VITE_API_URI}/api/dynamic/${table}/${id}`, values, {
      headers: {
        "Authorization": `Bearer ${token}`
      }
    }
    ).then(res => {
      toast.success(table == 'master' ? `Spot Updated!` : `${res.data.message}`)
      setTimeout(() => {
        if (!isSave) {
          if (isModal) {
            handleClose();
          } else {
            if (!stepper) {
              navigate(-1)
            }
          }
        }
      }, 100)
    }).catch(rej => {

      toast.error(rej?.response?.data?.message || rej?.message)
      console.error(rej?.response?.data?.message);
    }).finally(() => {
      setIsLoading(false)
    })
  }


  useEffect(() => {
    // const totalPackageData = form.getFieldValue('targetPackage')

    if (status == 'awaitingLoadInputs') {
      form.setFieldsValue({ targetPackage: dynamicCount });
    }

  }, [dynamicCount])


  useEffect(() => {
    if (isUpdate) {
      executeClientScript('portal');
      if (Object.keys(optimizedData).includes('portal')) {
        relationshipVisibility();
      }
    }
  }, [optimizedData, refOptionsClone, isUpdate]);

  useEffect(() => {
    // console.log("TABELNAME:",tableName);
    // if(tableName=='candidate'){
    const storedResultJson = localStorage.getItem('resultJsonForAutoFill');
    const storedResumePath = localStorage.getItem('uploadedResumePath');
    const autofillTriggered = localStorage.getItem('autofillTriggered');
    if (!autofillTriggered) return;

    console.log("Autofill Triggered------------>:", autofillTriggered);

    if (storedResultJson || storedResumePath) {
      const autofillData = {};

      if (storedResultJson) {
        const parsedResultJson = JSON.parse(storedResultJson);
        Object.assign(autofillData, parsedResultJson);
      }

      if (storedResumePath) {
        const fileName = decodeURIComponent(storedResumePath.match(/[^/]+$/)?.[0] || "Resume.pdf");

        autofillData.resume = [
          {
            uid: '1',  // Unique identifier for Ant Design's Upload
            name: fileName,
            url: storedResumePath,
            status: 'done', // Mark upload as completed
          },
        ];
      }

      if (autofillData.status && formValues.status !== autofillData.status) {
        console.log("Status field updated during autofill:", autofillData.status);

        const currentDateTime = moment().format('YYYY-MM-DD HH:mm:ss'); // Current date and time
        const updatedStatusHistory = [
          ...(formValues.statusHistory || []),
          {
            changedDate: currentDateTime,
            statusName: autofillData.status,
            changedBy: user?.name || "Unknown User",
          },
        ];

        autofillData.statusHistory = updatedStatusHistory;
      }

      console.log("Autofill Data:", JSON.stringify(autofillData));

      // Set the form fields
      setFormValues(autofillData);
      form.setFieldsValue(autofillData)
      console.log(optimizedData);
      executeClientScript('portal');
      if (Object.keys(optimizedData).includes('portal')) {
        relationshipVisibility();
        localStorage.removeItem('autofillTriggered');
        localStorage.removeItem('resultJsonForAutoFill');
        localStorage.removeItem('uploadedResumePath');
      }
    }
    //}

  }, [optimizedData, refOptionsClone, refOptions]);

  const setFormValue = (key, value) => {
    setFormValues(prevValues => ({
      ...prevValues,
      [key]: value
    }));
    console.log("12345678998765-------->", formValues);
  };

  // const setFormValue = (key, value) => {
  //   setFormValues((prevValues) => ({
  //     ...prevValues,
  //     [key]: value,
  //   }));
  //   return Promise.resolve(); // Simulate synchronous behavior
  // };






  const handleSubmit = async (isSave = false, values) => {
    // setIsLoading(true);

    if (onSubmitScript) {
      const scriptResult = await executeOnSubmitScript(values); // Wait for script execution

      if (scriptResult?.action === "preventSubmit") {
        setIsLoading(false);
        return; // Stop further execution if the script prevents submission
      }
    }

    console.log("canSubmit state", canSubmit);

    if (!canSubmit) {
      setIsLoading(false);
      return;
    }

    let updatedValues = { ...values };

    if (roleList?.length > 0) {
      updatedValues.roles = roleList;
    }
    if (splitUpData && Object.keys(splitUpData)?.length > 0) {
      updatedValues[splitUpDataKey] = splitUpData;
    }
    if (MultiSelectList?.length > 0) {
      updatedValues[multipleSelectKey] = MultiSelectList;
    }
    if (MultiSelectListAPI?.length > 0) {
      updatedValues[multipleSelectKeyAPI] = MultiSelectListAPI;
    }
    if (approvalChainList?.length > 0) {
      updatedValues[approvalChainKey] = approvalChainList;
    }
    if (permissionsList?.length > 0) {
      updatedValues.permissions = permissionsList.join(',');
    }
    if (chatHistory?.length > 0) {
      updatedValues['chatHistory'] = chatHistory;
    }
    if (weeklyOffDays && Object.keys(weeklyOffDays).length > 0) {
      updatedValues['weeklyOffDays'] = weeklyOffDays;
    }
    if (keyValuepair && Object.keys(keyValuepair).length > 0) {
      updatedValues['keyValuepair'] = keyValuepair;
    }
    if (projectAllocations && Object.keys(projectAllocations).length > 0) {
      updatedValues['projectAllocations'] = projectAllocations;
    }
    if (dataFromChild && Object.keys(dataFromChild).length > 0) {
      updatedValues[dataFromChild.key] = dataFromChild.value;
    }

    // Detect if the status field has changed
    if (formValues.status !== updatedValues.status) {
      console.log("Status field updated:", updatedValues.status);

      // Add logic to update statusHistory if needed
      const currentDateTime = moment().format('YYYY-MM-DD HH:mm:ss'); // Extract only the date in YYYY-MM-DD format
      const updatedStatusHistory = [
        ...(formValues.statusHistory || []),
        {
          changedDate: currentDateTime,
          statusName: updatedValues.status,
          changedBy: user?.name || "Unknown User",
        },
      ];

      updatedValues.statusHistory = updatedStatusHistory;
    }

    console.log("submitValues", updatedValues);
    // Check if formsResubmission is true

    console.log("action",action);

    if (stepper && action == "create"){
      createRecord(updatedValues, isSave);
    }
    else if (stepper && action == "update") {
      updateRecord(updatedValues, isSave);
    }
    else if (formsResubmission) {
      // Create a new record instead of updating
      createRecord(updatedValues, isSave);
    } else {
      // Update the record if formsResubmission is false
      if (!isUpdate || updateId === undefined) {
        createRecord(updatedValues, isSave);
      } else {
        updateRecord(updatedValues, isSave);
      }
    }
  };





  const handleBackButtonClick = () => {
    if (isModal) {
      handleClose();
    } else {
      if (!stepper) {
        navigate(-1)
      }
    }
  }
  const relationshipVisibility = () => {
    console.log("Optimized Data:", optimizedData);
    const fields = Object.keys(optimizedData)
    const inclusiveFields = []
    fields.forEach(field => {
      const fieldData = optimizedData[field];
      const keys = Object.keys(fieldData);

      console.log(field, '--->', form.getFieldValue(field), fieldData, keys.includes(form.getFieldValue(field)))
      keys.forEach(key => {
        console.log(fieldData[key], '---->', (field));

        if (form.getFieldValue(field) == key) {
          inclusiveFields.push(...fieldData[key]);
        }
      }
      )
    });

    const exclusiveFields = tempFormData[0].fields.filter(field => !field.fieldRelationshipVisibility || inclusiveFields.includes(field.key));
    console.log("Inclusive Fields:", inclusiveFields);
    console.log("Exclusive Fields:", exclusiveFields);
    setMappedFormData([{ section: tempFormData[0].section, fields: [...exclusiveFields] }]);
  }

  const displayAlertMessage = (title, description, type = "info") => {
    console.log("Inside Alert function");

    setAlertMessage({ "description": description, "title": title, "type": type })

  }


  const formValuesOnChange = (changedValues, allValues) => {
    const changedField = Object.keys(changedValues)[0];

    if (changedField) {
      setLastChangedField(changedField);
    }

    console.log("Last changed field:", changedField);
    console.log("Updated values:---?", allValues);
    executeClientScript(changedField);
    if (Object.keys(optimizedData).includes(changedField)) {
      relationshipVisibility();
    }
  }

  const customActions = [
    {
      label: (
        <a href="https://www.antgroup.com" target="_blank" rel="noopener noreferrer">
          1st menu item
        </a>
      ),
      key: "0",
    },
    {
      label: (
        <a href="https://www.aliyun.com" target="_blank" rel="noopener noreferrer">
          2nd menu item
        </a>
      ),
      key: "1",
    },
    {
      type: "divider",
    },
    {
      label: "3rd menu item",
      key: "3",
      onClick: () => alert("3rd menu item clicked!"),
    },
  ];

  useEffect(() => {
    console.log(refOptions);

  }, [refOptions]);

  const changeOptions = (field, options) => {
    const newFields = formData?.fields.map(f => {
      if ((f.key === field) && (f.type === 'reference')) {
        console.log("Changing options for field:", field, refOptions[field], f.refLabelName, f.refLabelName, options);
        setRefOptions(prevState => ({ ...prevState, [field]: options }));
        // setRefOptionsClone(prevState => ({ ...prevState, [field]: options }));
      }
    }
    )
    // console.log("Changing options for field:", field, options, formData?.fields);
  }

  const executeClientScript = async (changedField) => {
    // Initialize DS object with required methods
    ds.form = form;
    ds.user = user;
    ds.token = token;
    ds.disableSubmit = disableSubmit;
    ds.enableSubmit = enableSubmit;
    ds.disable = disable;
    ds.disableField = disableField;
    ds.dayjs = dayjs;
    ds.formResubmission = formResubmission;
    ds.formData = formData;
    ds.refOptions = refOptionsClone;
    ds.changeOptions = changeOptions;
    ds.formValues = formValues;
    ds.changedField = changedField;
    ds.displayAlertMessage = displayAlertMessage
    ds.baseURL = `${import.meta.env.VITE_API_URI}`;
    ds.setField = (form, field, value) => {
      form.setFieldsValue({ [field]: value });
    };
    ds.setFormValue = setFormValue;

    if (ds.form && clientscript) {
      try {
        console.log("Executing onChange client script...");


        const asyncScript = new Function(
          "ds",
          `return (async () => {
          try {
            ${clientscript}
          } catch(e) {
           
            return {
              action: "preventSubmit",
              message: "Error initializing form"
            };
          }
        })();`
        );

        const result = await asyncScript(ds);
        console.log("onChange script result:", result);

        if (result?.action === "preventSubmit") {

          // console.error("onChange validation failed:", result.message);
          setCanSubmit(false);
          if (result.message) {
            setCanSubmit(false);
            // toast.error(result.message);

          }

          else {
            setCanSubmit(true);
          }
        }
        else {
          setCanSubmit(true);
        }


      } catch (error) {
        console.error("Error executing onChange script:", error);
        setCanSubmit(false);
      }
    }

  };

  const executeOnLoadScript = async () => {
    // Initialize DS object with required methods
    ds.form = form;
    ds.user = user;
    ds.token = token;
    ds.disableSubmit = disableSubmit;
    ds.enableSubmit = enableSubmit;
    ds.disable = disable;
    ds.disableField = disableField;
    ds.dayjs = dayjs;
    ds.setField = (form, field, value) => {
      form.setFieldsValue({ [field]: value });
    };

    if (ds.form && onLoadScript) {
      try {
        console.log("Executing onLoad client script...");

        const asyncScript = new Function(
          "ds",
          `return (async () => {
          try {
            ${onLoadScript}
          } catch(e) {
           
            return {
              action: "preventSubmit",
              message: "Error initializing form"
            };
          }
        })();`
        );

        const result = await asyncScript(ds);
        console.log("onLoad script result:", result);

        if (result?.action === "preventSubmit") {
          setCanSubmit(false);
          // console.error("onLoad validation failed:", result.message);
          if (result.message) {
            // toast.error(result.message);
            setCanSubmit(false);
          }
          else {
            setCanSubmit(true);
          }
        }
        else {
          setCanSubmit(true);
        }




      } catch (error) {
        console.error("Error executing onLoad script:", error);
        setCanSubmit(false);
      }
    }

  };

  const executeOnSubmitScript = async (values) => {
    ds.form = form;
    ds.user = user;
    ds.token = token;
    ds.disableSubmit = disableSubmit;
    ds.enableSubmit = enableSubmit;
    ds.disable = disable;
    ds.disableField = disableField;
    ds.dayjs = dayjs;
    ds.fieldValidateFailed = fieldValidateFailed;
    ds.setField = (form, field, value) => {
      form.setFieldsValue({ [field]: value });
    };
    ds.baseURL = `${import.meta.env.VITE_API_URI}`;
    ds.setFormValue = setFormValue;
    ds.formValues = values

    if (ds.form && onSubmitScript) {
      try {
        console.log("Executing onSubmit script...");

        const asyncScript = new Function(
          "ds",
          `return (async () => {
          try {
            ${onSubmitScript}
          } catch(e) {
            console.error("onSubmit script execution error:", e);
            return {
              action: "preventSubmit",
              message: "Validation error occurred"
            };
          }
        })();`
        );

        const result = await asyncScript(ds);
        console.log("onSubmit script result:", result);

        if (result?.action === "preventSubmit") {
          setCanSubmit(false);
          console.error("Validation failed:", result.message);
        }
        else {
          setCanSubmit(true);
        }


        return result; // Explicitly return the result
      } catch (error) {
        console.error("Error executing onSubmit script:", error);
        setCanSubmit(false);
        return { action: "preventSubmit", message: "Error in script execution" }; // Return an error result
      }
    }
  };

  function fieldValidateFailed() {
    console.log("error submiting__-------->")
  }
  function disableField(form, field, canEdit) {
    const currentFieldValue = form.getFieldValue(field);

    form.setFields([
      {
        name: field,
        value: currentFieldValue, // Preserve the current value
        errors: canEdit ? [] : ["Manager Only Need To Edit"], // Set errors if needed
      },
    ]);

    // Dynamically update the field's disabled state
    // In your JavaScript
    const fieldElement = document.querySelector(`[id="${field}"]`);
    if (fieldElement) {
      fieldElement.disabled = !canEdit;

      // For number inputs, add inline styles to hide spin buttons
      if (fieldElement.type === 'number') {
        console.log("tyepe", fieldElement.type);
        if (!canEdit) {
          fieldElement.style.pointerEvents = 'none';
          fieldElement.style.webkitAppearance = 'none';
          fieldElement.style.mozAppearance = 'textfield';
          fieldElement.blur();

          // Hide spin buttons in WebKit browsers
          fieldElement.style.setProperty('--webkit-inner-spin-button', 'none');
          fieldElement.style.setProperty('--webkit-outer-spin-button', 'none');
        } else {
          // Reset styles when enabling
          fieldElement.style.pointerEvents = '';
          fieldElement.style.webkitAppearance = '';
          fieldElement.style.mozAppearance = '';
          fieldElement.style.removeProperty('--webkit-inner-spin-button');
          fieldElement.style.removeProperty('--webkit-outer-spin-button');
        }
      }
    }
  }
  function disableSubmit() {
    setIsSubmitDisabled(false);
  }
  function enableSubmit() {
    setIsSubmitDisabled(true); // This enables the button
  }
  function disable() {
    setCanEdit(false);
    console.log("thisCanEdit from dynamicform", thisCanEdit);
  }
  function formResubmission() {
    setFormResubmission(true);
  }





  function checkRoles(fieldRolesToEdit, globalRoles) {
    // If Array 1 (fieldRolesToEdit) is null or empty, return false
    // console.log("fieldsRolestoedit", fieldRolesToEdit, globalRoles);
    if (!Array.isArray(fieldRolesToEdit) || fieldRolesToEdit.length === 0) {
      // console.log("in1");
      return false;
    }

    // If Array 2 (globalRoles) is null or empty, return true
    if (!Array.isArray(globalRoles) || globalRoles.length === 0) {
      // console.log("in2");
      return true;
    }

    // Check for matches between the two arrays
    const hasMatch = fieldRolesToEdit.some(role => globalRoles.includes(role));

    // If at least one match is found, return false
    if (hasMatch) {
      // console.log("in3");
      return false;
    }

    // If no matches are found, return true
    return true;
  }

  const fields = [/* your fields array */];

  function mapFieldsToSections(fields, sections) {
    const result = [];
    // console.log("entered");

    // If fields is null or undefined, return null
    if (!fields) {
      return null;
    }

    // Iterate over fields and group them by sectionNumber
    fields.forEach(field => {
      let sectionName = "Others"; // Default to "Others"

      // If sections array is valid and not empty, determine the section name
      if (sections && sections.length > 0) {
        const sectionIndex = parseInt(field.sectionNumber, 10); // Convert sectionNumber to 0-based index
        sectionName = sections[sectionIndex] || "Others"; // Get section name or default to "Others"
      }

      // Find if the section already exists in the result array
      let section = result.find(item => item.section === sectionName);

      // If section doesn't exist, create it
      if (!section) {
        section = { section: sectionName, fields: [] };
        result.push(section);
      }

      // Push the field to the corresponding section
      section.fields.push(field);
    });

    // Sort the result to ensure "Others" is the last element
    const sortedResult = result.sort((a, b) => {
      if (a.section === "Others") return 1;
      if (b.section === "Others") return -1;
      return sections.indexOf(a.section) - sections.indexOf(b.section);
    });

    // console.log("result", sortedResult);
    return sortedResult;
  }



  const handleSlabChange = (slabs) => {
    // Handle the updated slabs data
    console.log(slabs);
  };

  const handleDataFromChild = (data, field) => {
    setDataFromChild({ key: field.key, value: data }); // Store both key and value

    setFormValues((prevValues) => ({
      ...prevValues,
      [field.key]: data,
    }));
  };
  // const isFieldVisible = (field, formValues) => {
  //   if (!field.fieldRelationshipVisibility || !field.ValueRelationshipVisibility) {
  //     return true; // If no visibility conditions, always show the field
  //   }

  //   const relatedFieldValue = formValues[field.fieldRelationshipVisibility];
  //   const allowedValues = field.ValueRelationshipVisibility.split(","); // Split comma-separated values

  //   return allowedValues.includes(relatedFieldValue);
  // };

  // const sections = ["section 1", "section 2"];


  // Example Usage
  // const mappedResult = mapFieldsToSections(formData?.fields, formData?.sections?.split(','));
  // console.log(mappedResult);

  useEffect(() => {
    try {
      // console.log("formData", formData?.fields, formData?.sections?.split(','));

      if (formData?.fields) {
        const result = mapFieldsToSections(formData?.fields, formData?.sections?.split(","));
        setMappedFormData(result);
        setTempFormData(result);
        const tempOptimizedData = result[0].fields.reduce((acc, field) => {
          if (!field.fieldRelationshipVisibility || field.fieldRelationshipVisibility === "default") {
            return acc; // Ignore fields with "default" visibility
          }

          const visibility = field.fieldRelationshipVisibility;
          if (!acc[visibility]) {
            acc[visibility] = {};
          }

          const { fieldRelationshipVisibility, valueRelationshipVisibility, key } = field;

          if (valueRelationshipVisibility) {  // Ensure it's defined before splitting
            valueRelationshipVisibility.split(",").forEach(id => {
              if (!acc[visibility][id]) {
                acc[visibility][id] = [];
              }
              acc[visibility][id].push(key);
            });
          }
          return acc;
        }, {});
        setOptimizedData(tempOptimizedData)
      }
    } catch (error) {
      console.log(formData?.fields, error);
    }
  }, [formData?.fields, formData?.sections]); // Only run when formData.fields or formData.sections change


  const renderField = (field) => {
    // Generate regex rule if provided
    // const isVisible = isFieldVisible(field, form.getFieldsValue());
    // if (!isVisible) {
    //   return null; // Skip rendering if the field is not visible
    // }
    const regexRule = field.regex ? [{ pattern: new RegExp(field.regex), message: `Invalid Value for ${field.label}` }] : [];
    const hasMatchingEditRoles = checkRoles(field.rolesToEdit, globalRoles)
    let disabledRule = (
      ((isUpdate && (formValues[field.key] !== undefined ? formValues[field.key] && field.disabledAfterFilled : true)) || hasMatchingEditRoles)
    );
    // console.log("--->",isUpdate,formValues[field.key],field.disabledAfterFilled,hasMatchingEditRoles);
    // console.log("disables1", disabledRule);

    if (disabledEdit) {
      disabledRule = false;
    }

    const customValidator = (_, value) => {
      if (field.relativeField) {
        const relativeFieldValue = form.getFieldValue(field.relativeField);

        switch (field.relation) {
          case "greaterthan":
            if (value < relativeFieldValue) {
              return Promise.reject(new Error(field.relativeFieldErrorText || `${field.label} must be greater than ${field.relativeField}`));
            }
            break;

          case "greaterthanequalto":
            if (value <= relativeFieldValue) {
              return Promise.reject(new Error(field.relativeFieldErrorText || `${field.label} must be greater than ${field.relativeField}`));
            }
            break;

          case "lesserthan":
            if (value > relativeFieldValue) {
              return Promise.reject(new Error(field.relativeFieldErrorText || `${field.label} must be less than ${field.relativeField}`));
            }
            break;

          case "lesserthanequalto":
            if (value >= relativeFieldValue) {
              return Promise.reject(new Error(field.relativeFieldErrorText || `${field.label} must be less than ${field.relativeField}`));
            }
            break;

          case "equals":
            if (value !== relativeFieldValue) {
              return Promise.reject(new Error(field.relativeFieldErrorText || `${field.label} must equal ${field.relativeField}`));
            }
            break;

          case "contains":
            if (!value?.toString().includes(relativeFieldValue?.toString())) {
              return Promise.reject(new Error(field.relativeFieldErrorText || `${field.label} must contain ${field.relativeField}`));
            }
            break;

          default:
            return Promise.resolve();
        }
      }
      return Promise.resolve();
    };
    const getCustomProperties = (fieldKey) => {
      const properties = {
        // Default properties for all fields
        disabled: false,
        readOnly: false,
        hidden: false,
        style: {}
      };

      // Field-specific overrides
      switch (fieldKey) {
        case 'managersRating':
          return {
            disabled: true,
          };

        case 'employeeId':
          return {
            ...properties,
            disabled: isUpdate,
            readOnly: isUpdate
          };

        case 'loanAmount':
          return {
            ...properties,
            style: { fontWeight: 'bold' }
          };

        // Add more field cases as needed

        default:
          return properties;
      }
    };

    const handleInputChange = (key, value, isFileUpload = false) => {
      if (!key) {
        console.error("Error: Key is undefined or null");
        return;
      }
      console.log("value1", value);
      if (isFileUpload) {
        const updatedValue = Array.isArray(value) ? value : [value];
        form.setFieldsValue({ [key]: updatedValue });
      } else {
        form.setFieldsValue({ [key]: value });
      }
      console.log("value", form.getFieldValue(key));
    };
    // if (disableAll ) {
    //   disabledRule = true
    // }
    // console.log("disables", disabledRule)
    switch (field.type) {
      case 'slab':
        return (
          <Form.Item
            label={field.label}
            name={field.key}
            rules={[
              { required: field.required, message: `${field.label} is required` },
              { validator: customValidator },
            ]}
            {...(
              field?.tooltip?.trim().length > 0
                ? { tooltip: { title: field.tooltip.trim(), icon: <InfoCircleOutlined /> } }
                : {}
            )}
          >
            <SlabContainer defaultValue={isUpdate && formValues[field.key]} onChange={(slabs) => form.setFieldsValue({ [field.key]: slabs })} />
          </Form.Item>
        );

        case 'customSlab':
          return (
            <Form.Item
              label={field.label}
              name={field.key}
              rules={[
                { required: field.required, message: `${field.label} is required` },
                { validator: customValidator },
              ]}
              {...(
                field?.tooltip?.trim().length > 0
                  ? { tooltip: { title: field.tooltip.trim(), icon: <InfoCircleOutlined /> } }
                  : {}
              )}
            >
              <CustomSlab defaultValue={isUpdate && formValues[field.key]} onChange={(slabs) => form.setFieldsValue({ [field.key]: slabs })}  addButtonText={field?.addButtonText}  infiniteLastValue = {field?.infiniteLastValue} columnConfig={field?.colConfig} />
            </Form.Item>
          );

      case 'number':
        return (
          <Form.Item
            initialValue={isUpdate ? (formValues[field.key] || '') : ((field.disabledWithDefaultValue || field.fillDefaultValue) ? eval(field.defaultValue) : field.defaultValue)}
            label={field.label}
            name={field.key}
            rules={[
              { required: field.required, message: `${field.label} is required` },
              ...regexRule, // Add regex validation
              { validator: customValidator },
            ]}
            {...(
              field?.tooltip?.trim().length > 0
                ? { tooltip: { title: field.tooltip.trim(), icon: <InfoCircleOutlined /> } }
                : {}
            )}
          >
            <InputNumber
              placeholder={field.placeholder || field.label}
              name={field.key}
              style={{ width: '100%' }}
              disabled={field.disabled || disabledRule || field.disabledWithDefaultValue}
            />
          </Form.Item>
        );

      case 'codeEditor':
        return (
          <Form.Item
            label={field.label}
            name={field.key}
            // rules={[
            //   { required: field.required, message: `${field.label} is required` },
            // ]}
            {...(
              field?.tooltip?.trim().length > 0
                ? { tooltip: { title: field.tooltip.trim(), icon: <InfoCircleOutlined /> } }
                : {}
            )}
          >
            <CodeEditor
              defaultValue={isUpdate && formValues[field.key]}
              onChange={(value) => form.setFieldsValue({ [field.key]: value })}
              defaultLanguage={field.codeEditorLanguage}
            />
          </Form.Item>
        );


      case 'textbox':

        return (
          <Form.Item
            label={field.label}
            name={field.key}
            rules={[
              { required: field.required, message: `${field.label} is required` },
              ...regexRule, // Add regex validation
              { validator: customValidator },
            ]}
            initialValue={isUpdate ? (formValues[field.key] || '') : ((field.disabledWithDefaultValue || field.fillDefaultValue) ? eval(field.defaultValue) : field.defaultValue)}
            // tooltip="This is a required field"
            {...(
              field?.tooltip?.trim().length > 0
                ? { tooltip: { title: field.tooltip.trim(), icon: <InfoCircleOutlined /> } }
                : {}
            )}
          >
            <Input placeholder={field.placeholder || field.label} disabled={field.disabled || disabledRule || field.disabledWithDefaultValue} id={field.key} onInput={(e) => {
              if (field.allowOnlyCaps) {
                e.target.value = e.target.value.toUpperCase()
              }
            }} />
          </Form.Item>
        );

      case 'password':

        return (
          <Form.Item
            label={field.label}
            name={field.key}
            rules={[
              { required: field.required, message: `${field.label} is required` },
              ...regexRule, // Add regex validation
              { validator: customValidator },
            ]}
            initialValue={isUpdate ? (formValues[field.key] || '') : ((field.disabledWithDefaultValue || field.fillDefaultValue) ? eval(field.defaultValue) : field.defaultValue)}
            {...(
              field?.tooltip?.trim().length > 0
                ? { tooltip: { title: field.tooltip.trim(), icon: <InfoCircleOutlined /> } }
                : {}
            )}

          >
            <Input.Password placeholder={field.placeholder || field.label} disabled={field.disabled || disabledRule || field.disabledWithDefaultValue} id={field.key} />
          </Form.Item>
        );


      case 'colorpicker':
        console.log(field, formValues[field.key]);

        return (
          <Form.Item
            label={field.label}
            name={field.key}
            rules={[
              { required: field.required, message: `${field.label} is required` },
              ...regexRule, // Add regex validation
              { validator: customValidator },
            ]}
            // initialValue={isUpdate ? (formValues[field.key] || '') : ((field.disabledWithDefaultValue || field.fillDefaultValue) ? eval(field.defaultValue) : field.defaultValue)}
            {...(
              field?.tooltip?.trim().length > 0
                ? { tooltip: { title: field.tooltip.trim(), icon: <InfoCircleOutlined /> } }
                : {}
            )}
          >
            {/* <Input placeholder={field.placeholder || field.label} disabled={field.disabled || disabledRule || field.disabledWithDefaultValue} id={field.key} onInput={(e) => {
              if (field.allowOnlyCaps) {
                e.target.value = e.target.value.toUpperCase()
              }
            }} /> */}
            <ColorPicker defaultValue={formValues[field.key]?.metaColor} showText />
          </Form.Item>
        );


      case 'textarea':  // New case for textarea
        return (
          <Form.Item
            label={field.label}
            name={field.key}
            rules={[
              { required: field.required, message: `${field.label} is required` },
              ...regexRule, // Add regex validation
              { validator: customValidator },
            ]}
            {...(
              field?.tooltip?.trim().length > 0
                ? { tooltip: { title: field.tooltip.trim(), icon: <InfoCircleOutlined /> } }
                : {}
            )}
            initialValue={isUpdate ? (formValues[field.key] || '') : ((field.disabledWithDefaultValue || field.fillDefaultValue) ? eval(field.defaultValue) : field.defaultValue)}          >
            <Input.TextArea rows={8} placeholder={field.placeholder || field.label} disabled={field.disabled || disabledRule || field.disabledWithDefaultValue} id={field.key} />
          </Form.Item>
        );
      case 'autoincrement':
        return (
          <Form.Item
            label={field.label}
            name={field.key}
            rules={[
              { required: field.required, message: `${field.label} is required` },
              { validator: customValidator },
            ]}
            {...(
              field?.tooltip?.trim().length > 0
                ? { tooltip: { title: field.tooltip.trim(), icon: <InfoCircleOutlined /> } }
                : {}
            )}
            initialValue={isUpdate ? (formValues[field.key] || '') : ((field.disabledWithDefaultValue || field.fillDefaultValue) ? eval(field.defaultValue) : field.defaultValue)}          >
            <Input disabled id={field.key} />
          </Form.Item>
        );
      case 'dropdown':
        // Safely get options with fallback to empty array
        const options = Array.isArray(field.options) ? field.options : [];

        // Safer default value handling without eval()
        const getDefaultValue = () => {
          if (isUpdate) {
            return formValues[field.key] || '';
          }
          if (field.disabledWithDefaultValue || field.fillDefaultValue) {
            try {
              // Parse defaultValue safely
              if (typeof field.defaultValue === 'string') {
                return JSON.parse(field.defaultValue);
              }
              return field.defaultValue;
            } catch (e) {
              console.warn('Invalid defaultValue format for field', field.key);
              return '';
            }
          }
          return '';
        };

        // Format initial value based on select mode
        const initialValue = getDefaultValue();
        const isMultiple = field.allowMultipleSelectionManual;

        // Ensure array format for multiple select
        const formattedInitialValue = isMultiple
          ? Array.isArray(initialValue) ? initialValue : [initialValue].filter(Boolean)
          : initialValue;

        return (
          <Form.Item
            label={field.label}
            name={field.key}
            rules={[
              { required: field.required, message: `${field.label} is required` },
              { validator: customValidator },
            ]}
            initialValue={formattedInitialValue}
            {...(
              field?.tooltip?.trim().length > 0
                ? { tooltip: { title: field.tooltip.trim(), icon: <InfoCircleOutlined /> } }
                : {}
            )}
          >
            <Select
              placeholder={field.placeholder || field.label}
              disabled={field.disabled || disabledRule || field.disabledWithDefaultValue}
              id={field.key}
              showSearch
              mode={field.allowMultipleSelectionManual ? 'multiple' : undefined}
              notFoundContent={options.length ? undefined : 'No options available'}
            >
              {options.map((option) => (
                <Option
                  key={option.value}
                  value={option.value}
                  disabled={option.disabled}
                >
                  {option.label}
                </Option>
              ))}
            </Select>
          </Form.Item>
        );
      case 'date':
        return (
          <Form.Item
            label={field.label}
            name={field.key}
            rules={[
              {
                required: field.required,
                message: `${field.label} is required`,
                validator: (_, value) => {
                  if (field.required && !value) {
                    return Promise.reject(new Error(`${field.label} is required`));
                  }
                  return Promise.resolve();
                },
              },
              { validator: customValidator },

            ]}
            initialValue={isUpdate && (formValues[field.key] ? dayjs(formValues[field.key]) : null)}
            {...(
              field?.tooltip?.trim().length > 0
                ? { tooltip: { title: field.tooltip.trim(), icon: <InfoCircleOutlined /> } }
                : {}
            )}
          >
            <DatePicker
              id={field.key}
              style={{ width: '100%' }}
              format={field.dateFormat || 'DD-MM-YYYY'}
              placeholder={field.placeholder || field.label}
              disabled={field.disabled || disabledRule || field.disabledWithDefaultValue}
              disabledDate={(current) => {
                // Ensure `current` is a valid date object
                if (!current || !current.isValid()) {
                  console.log('Invalid current date:', current);
                  return false;
                }

                // Calculate the start and end dates based on the offsets
                const startDate = field.startOffset !== undefined ? dayjs().add(field.startOffset, 'day').startOf('day') : null;
                const endDate = field.endOffset !== undefined ? dayjs().add(field.endOffset, 'day').endOf('day') : null;

                // // Log the calculated dates
                // console.log('Field:', field.key);
                // console.log('Start Date:', startDate ? startDate.format('DD-MM-YYYY') : 'undefined');
                // console.log('End Date:', endDate ? endDate.format('DD-MM-YYYY') : 'undefined');
                // console.log('Current Date:', current.format('DD-MM-YYYY'));

                // Disable dates before the start date or after the end date
                const isDisabled = (startDate && current.isBefore(startDate, 'day')) || (endDate && current.isAfter(endDate, 'day'));
                // console.log('Is Disabled:', isDisabled);

                return isDisabled;
              }}
            />
          </Form.Item>
        );

      case 'yearRange':
        return (
          <Form.Item
            label={field.label}
            name={field.key}
            rules={[
              { required: field.required, message: `${field.label} is required` },
              { validator: customValidator },
            ]}
            initialValue={
              isUpdate && formValues[field.key]
                ? [
                  formValues[field.key][0] ? moment(formValues[field.key][0], 'YYYY', true).format('YYYY') : null,
                  formValues[field.key][1] ? moment(formValues[field.key][1], 'YYYY') : null,
                ]
                : null
            }
            {...(
              field?.tooltip?.trim().length > 0
                ? { tooltip: { title: field.tooltip.trim(), icon: <InfoCircleOutlined /> } }
                : {}
            )}
          >
            <DatePicker.RangePicker
              id={field.key}
              style={{ width: '100%' }}
              picker={field.rangeType || 'year'}
              format={
                field.rangeType === 'year'
                  ? 'YYYY'
                  : field.rangeType === 'month'
                    ? 'YYYY-MM'
                    : 'YYYY-[W]WW'
              }
              placeholder={[
                `Start ${field.rangeType || 'Year'}`,
                `End ${field.rangeType || 'Year'}`,
              ]}
              disabled={field.disabled || disabledRule}
              onCalendarChange={(dates) => {
                console.log(' Selected Dates:', dates); // Debugging log

                if (dates && dates[0]) {
                  let formattedStart = null;
                  let formattedEnd = null;

                  if (field.rangeType === 'year') {
                    const startYear = moment.isMoment(dates[0]) ? dates[0].year() : null;
                    const endYear = startYear ? startYear + 1 : null;
                    formattedStart = startYear ? moment(startYear, 'YYYY') : null;
                    formattedEnd = endYear ? moment(endYear, 'YYYY') : null;
                  } else if (field.rangeType === 'month') {
                    formattedStart = moment.isMoment(dates[0]) ? moment(dates[0]).format('YYYY-MM') : null;
                    formattedEnd = moment.isMoment(dates[1]) ? moment(dates[1]).format('YYYY-MM') : null;
                  } else if (field.rangeType === 'week') {
                    formattedStart = moment.isMoment(dates[0]) ? moment(dates[0]).format('YYYY-[W]WW') : null;
                    formattedEnd = moment.isMoment(dates[1]) ? moment(dates[1]).format('YYYY-[W]WW') : null;
                  }

                  console.log('Formatted Start:', formattedStart);
                  console.log('Formatted End:', formattedEnd);

                  form.setFieldsValue({
                    [field.key]: formattedStart && formattedEnd ? [formattedStart, formattedEnd] : null,
                  });
                }
              }}
              disabledDate={(current) => {
                if (field.rangeType !== 'year') return false;

                let selectedStartYearStr = form.getFieldValue(field.key)?.[0];
                let tData = new Date("2020-02-06T18:30:00.000Z");
                console.log('Selected Start Year String:', selectedStartYearStr, tData.toISOString().slice(0, 4)); // Debugging log

                if (!selectedStartYearStr) return false;

                let selectedStartYear = !isNaN(selectedStartYearStr)
                  ? Number(selectedStartYearStr)
                  : moment(selectedStartYearStr, 'YYYY').year();

                console.log(' Computed Selected Start Year:', moment(selectedStartYearStr, 'YYYY').year());

                return selectedStartYear ? current.year() !== selectedStartYear + 1 : false;
              }}
            />
          </Form.Item>
        );

      case 'datetime':
        return (
          <Form.Item
            label={field.label}
            name={field.key}
            rules={[
              { required: field.required, message: `${field.label} is required` },
              { validator: customValidator },
            ]}
            {...(
              field?.tooltip?.trim().length > 0
                ? { tooltip: { title: field.tooltip.trim(), icon: <InfoCircleOutlined /> } }
                : {}
            )}
            initialValue={isUpdate ? (formValues[field.key] ? dayjs(formValues[field.key]) : (field.defaultValue == 'now') && dayjs()) : (field.defaultValue == 'now') && dayjs()}          >
            <DatePicker
              style={{ width: '100%' }}
              showTime={{ format: 'HH:mm' }}  // Allows selecting time in hours and minutes
              format={field.dateFormat || 'YYYY-MM-DD HH:mm'} // Combine date and time format
              placeholder={field.placeholder || field.label}
              disabled={field.disabled || disabledRule || field.disabledWithDefaultValue}
              id={field.key}
            />
          </Form.Item>
        );
      case "ctcbreakdown":
        return (
          <Form.Item
            label={field.label}
            name={field.key}
            rules={[
              { required: field.required, message: `${field.label} is required` },
            ]}
            {...(
              field?.tooltip?.trim().length > 0
                ? { tooltip: { title: field.tooltip.trim(), icon: <InfoCircleOutlined /> } }
                : {}
            )}
          >
            <CTCBreakdown
              defaultValue={isUpdate && formValues[field.key]} // Pass saved data
              onChange={(ctcBreakdown) => {
                form.setFieldsValue({ [field.key]: ctcBreakdown }); // Update form values
                // Optionally, call an API to update the database here
              }}
            />
          </Form.Item>

        );


      case "stepper":
        return (
          <Form.Item
            label={field.label}
            name={field.key}
            rules={[
              { required: field.required, message: `${field.label} is required` },
            ]}
            {...(
              field?.tooltip?.trim().length > 0
                ? { tooltip: { title: field.tooltip.trim(), icon: <InfoCircleOutlined /> } }
                : {}
            )}
          >
            <StepperTimeline
              table={table}
              value={timelineData[table] || []}
              defaultValue={isUpdate && formValues[field.key]}
              onChange={(data) => handleTimelineChange(table, data)}
              isUserProfile={userProfile}
            />
          </Form.Item>
        );
      case 'timepicker':
        return (
          <Form.Item
            label={field.label}
            name={field.key}
            rules={[
              { required: field.required, message: `${field.label} is required` },
              { validator: customValidator },
            ]}
            // initialValue={form.getFieldValue(field.key) ? dayjs(form.getFieldValue(field.key), "HH:mm") : null} 
            initialValue={isUpdate ? (formValues[field.key] ? dayjs(formValues[field.key]) : null) : (field.defaultValue == 'now') && dayjs()}
            {...(
              field?.tooltip?.trim().length > 0
                ? { tooltip: { title: field.tooltip.trim(), icon: <InfoCircleOutlined /> } }
                : {}
            )}
          >
            <TimePicker
              style={{ width: '100%' }}
              format={field.timeFormat || 'HH:mm'} // Ensure correct format
              placeholder={field.placeholder || field.label}
              disabled={field.disabled || disabledRule || field.disabledWithDefaultValue}
              id={field.key}
              value={isUpdate ? (formValues[field.key] ? dayjs(formValues[field.key], 'HH:mm') : (field.defaultValue == 'now') && dayjs()) : (field.defaultValue == 'now') && dayjs()}
            />
          </Form.Item>
        );

      case 'addableReference':
        return (
          <Form.Item
            label={field.label}
            name={field.key}
            rules={[
              { required: field.required, message: `${field.label} is required` },
            ]}
            {...(
              field?.tooltip?.trim().length > 0
                ? { tooltip: { title: field.tooltip.trim(), icon: <InfoCircleOutlined /> } }
                : {}
            )}
          >
            <AutoCompleteReference
              options={addableOptions}
              placeholder={field.placeholder}
              setOptions={setAddableOptions}
              refValueField={field.refValueField}
              refTableName={field.refTableName}
              selectedValues={formValues && formValues[field.key] ? formValues[field.key] : []}
              setSelectedValues={setSearchTerm}
              formValues={formValues}
              fieldKey={field.key}
              form={form}
            />
          </Form.Item>
        );


      case 'reference':
        return (
          <Form.Item
            label={field.label}
            name={field.key}
            rules={[{ required: field.required, message: `${field.label} is required` }, { validator: customValidator },]}
            {...(
              field?.tooltip?.trim().length > 0
                ? { tooltip: { title: field.tooltip.trim(), icon: <InfoCircleOutlined /> } }
                : {}
            )}
            initialValue={isUpdate ? (formValues[field.key] || '') : ((field.disabledWithDefaultValue || field.fillDefaultValue) ? eval(field.defaultValue) : field.defaultValue)}          >
            <Select placeholder={field.placeholder || field.label}
              disabled={field.disabled || disabledRule || field.disabledWithDefaultValue}
              id={field.key}
              showSearch optionFilterProp="label"
            >
              {refOptions[field.key]?.filter(refOption => {
                if (Object.keys(refOption).includes('active')) {
                  return refOption.active !== false;
                } else {
                  return true;
                }
              }).filter(option => {
                if (field.key === 'reportingManager') {
                  return option._id !== id;
                }
                return true; // For all other fields, include the options
              }).map((option, index) => (
                <Option key={index} value={option[field.refValueField]}>
                  {option[field.refLabelName]}
                </Option>
              ))}
            </Select>
          </Form.Item>
        );
      case 'multipleselectreference':
        return (
          <Form.Item
            label={field.label}
            name={field.key}
            rules={[
              // { required: field.required, message: `${field.label} is required` },
              {
                validator: (_, value) =>
                  field.required && (!MultiSelectList || MultiSelectList.length === 0)
                    ? Promise.reject(new Error(`${field.label} is required`))
                    : Promise.resolve(),
              },
            ]}
            {...(
              field?.tooltip?.trim().length > 0
                ? { tooltip: { title: field.tooltip.trim(), icon: <InfoCircleOutlined /> } }
                : {}
            )}
            initialValue={isUpdate ? (formValues[field.key] || '') : ((field.disabledWithDefaultValue || field.fillDefaultValue) ? eval(field.defaultValue) : field.defaultValue)}          >
            <MultiSelectPicker setMultipleSelectKey={setMultipleSelectKey} setMultiSelectList={setMultiSelectList} MultiSelectList={isUpdate ? formValues[field.key] : MultiSelectList} tableName={field.refTableName} labelName={field.refLabelName} valueName={field?.refValueField} field={field} />
          </Form.Item>
        );
      case 'checkbox':
        return (
          <Form.Item
            label={field.label}
            name={field.key}
            valuePropName="checked"
            rules={[
              { required: field.required, message: `${field.label} is required` },
              { validator: customValidator },
            ]}
            initialValue={isUpdate && (formValues[field.key] || '')}
            {...(
              field?.tooltip?.trim().length > 0
                ? { tooltip: { title: field.tooltip.trim(), icon: <InfoCircleOutlined /> } }
                : {}
            )}
          >
            <Switch disabled={field.disabled || disabledRule || field.disabledWithDefaultValue} id={field.key}>{field.placeholder}</Switch>
          </Form.Item>
        );

      case 'keyValue':
        return (
          <Form.Item
            label={field.label}
            name={field.key}
            rules={[
              { required: field.required, message: `${field.label} is required` },
              { validator: customValidator },
            ]}
            {...(
              field?.tooltip?.trim().length > 0
                ? { tooltip: { title: field.tooltip.trim(), icon: <InfoCircleOutlined /> } }
                : {}
            )}
          >
            <KeyValuepair
              initialData={keyValuepair}
              keyLabel={field.keyLabel}
              valueLabel={field.valueLabel}
              valueType={field.valueType}
              maxItems={field.maxCount}
              setKeyValuePair={setKeyValuePair}
              refTable={field?.refTableName || ''}
              refLabelName={field?.refLabelName || ''}
              refValueField={field?.refValueField || ''}
              allowDuplicates={field?.allowSelectDuplicate || ''}
              acceptedFileTypes={field?.acceptedFileTypes}
              keyType={field?.keyType}
              refTableForKey={field?.refTableNameForKey}
              refLabelNameForKey={field?.refLabelNameForKey}
              refValueFieldForKey={field?.refValueFieldForKey}
              allowDuplicatesForKey={field?.allowDuplicatesForKey}
              acceptedFileTypesForKey={field?.acceptedFileTypesForKey}
            />
          </Form.Item>
        );

      case 'rolepicker':
        return (
          <Form.Item
            label={field.label}
            name={field.key}
            rules={[
              { required: field.required, message: `${field.label} is required` },
              { validator: customValidator },
            ]}
            {...(
              field?.tooltip?.trim().length > 0
                ? { tooltip: { title: field.tooltip.trim(), icon: <InfoCircleOutlined /> } }
                : {}
            )}
          >
            <RolePicker disabled={disableAll || disabledRule || field.disabledWithDefaultValue} setRoleList={setRoleList} roleList={roleList} id={field.key} />
          </Form.Item>
        );
      case 'singlerolepicker':
        return (
          <Form.Item
            label={field.label}
            name={field.key}
            rules={[
              { required: field.required, message: `${field.label} is required` },
              { validator: customValidator },
            ]}
            {...(
              field?.tooltip?.trim().length > 0
                ? { tooltip: { title: field.tooltip.trim(), icon: <InfoCircleOutlined /> } }
                : {}
            )}
          >
            <RolePicker disabled={disableAll || disabledRule || field.disabledWithDefaultValue} setRoleList={setRoleList} roleList={roleList} mode='single' id={field.key} />
          </Form.Item>
        );
      case 'permissionpicker':
        return (
          <Form.Item
            label={field.label}
            name={field.key}
            rules={[
              { required: field.required, message: `${field.label} is required` },
              { validator: customValidator },
            ]}
            {...(
              field?.tooltip?.trim().length > 0
                ? { tooltip: { title: field.tooltip.trim(), icon: <InfoCircleOutlined /> } }
                : {}
            )}
          >
            <PermissionPicker setPermissionsList={setPermissionsList} permissionsList={permissionsList} id={field.key} disabled={disabledRule || field.disabledWithDefaultValue} />
          </Form.Item>
        );
      case 'splituptable':
        return (
          <Form.Item
            label={field.label}
            name={field.key}
            rules={[
              { required: field.required, message: `${field.label} is required` },
              { validator: customValidator },
            ]}
            {...(
              field?.tooltip?.trim().length > 0
                ? { tooltip: { title: field.tooltip.trim(), icon: <InfoCircleOutlined /> } }
                : {}
            )}
          >
            <SplitupTable disabledRule={disabledRule} setSplitUpDataKey={setSplitUpDataKey} splitUpData={isUpdate ? formValues[field.key] : splitUpData} setSplitUpData={setSplitUpData} tableNameForDropdown={field?.tableNameForDropdown} field={field} setDynamicCount={setDynamicCount} />
          </Form.Item>
        );
      // case "fileupload":
      //   return (
      //     <Form.Item
      //       label={field.label}
      //       name={field.key}
      //       rules={[
      //         { required: field.required, message: `${field.label} is required` },
      //         // { validator: customValidator },
      //       ]}
      //     >
      //       <Upload
      //         action={`${import.meta.env.VITE_API_URI}/api/data/file-upload`}
      //         listType="picture"
      //         maxCount={field?.maxCount}
      //         id={field?.key}
      //         accept={field?.inputType === "image" ? "image/*" : "*"}
      //         onChange={({ file, fileList }) => {
      //           console.log("Current File:", file);
      //           console.log("File List:", fileList);

      //           if (file.status === "done" || file.status === "removed") {
      //             const uploadedFiles = fileList
      //               .filter((f) => f.response?.url || f.url)
      //               .map((f) => ({
      //                 url: f.response?.url || f.url,
      //                 name: decodeURIComponent((f.response?.url || f.url).match(/[^/]+$/)?.[0] || ""),
      //               }));
      //             console.log("Updated File List on Change:", uploadedFiles);
      //             handleInputChange(field?.key, uploadedFiles, true);
      //           }
      //         }}

      //         onRemove={(file) => {
      //           let currentFiles = form.getFieldValue(field?.key) || [];
      //           if (!Array.isArray(currentFiles)) {
      //             currentFiles = [currentFiles];
      //           }
      //           console.log("Before Remove:", currentFiles);
      //           const updatedFiles = currentFiles.filter((f) => f.url !== file.response?.url);
      //           console.log("Updated Files After Removal:", updatedFiles);
      //           handleInputChange(field?.key, updatedFiles, true);
      //           form.setFieldsValue({ [field?.key]: updatedFiles });
      //         }}


      //         defaultFileList={
      //           Array.isArray(formValues?.[field?.key])
      //             ? formValues[field.key].map((fileObj) => ({
      //               url: fileObj.url,  // Extract the URL from the object
      //               name: decodeURIComponent(fileObj.url?.match(/[^/]+$/)?.[0] || ""),
      //             }))
      //             : []
      //         }

      //       // onRemove={() => handleInputChange(field?.key, "")}
      //       >
      //         <AntDButton icon={<UploadOutlined />} disabled={field.disabled}>
      //           {field.label}
      //         </AntDButton>
      //       </Upload>
      //     </Form.Item>
      //   );

      case "fileupload":
        return (
          <Form.Item
            label={field.label}
            name={field.key}
            rules={[
              { required: field.required, message: `${field.label} is required` },
              // { validator: customValidator },
            ]}
          >
            <Upload
              action={`${import.meta.env.VITE_API_URI}/api/data/file-upload`}
              listType="picture"
              maxCount={field?.maxCount}
              id={field?.key}
              accept={field?.inputType === "image" ? "image/*" : "*"}
              onChange={({ file, fileList }) => {
                console.log("Current File:", file);
                console.log("File List:", fileList);

                if (file.status === "done" || file.status === "removed") {
                  const uploadedFiles = fileList
                    .filter((f) => f.response?.url || f.url)
                    .map((f) => ({
                      url: f.response?.url || f.url,
                      name: decodeURIComponent((f.response?.url || f.url).match(/[^/]+$/)?.[0] || ""),
                    }));
                  console.log("Updated File List on Change:", uploadedFiles);
                  handleInputChange(field?.key, uploadedFiles, true);
                }
              }}

              onRemove={(file) => {
                let currentFiles = form.getFieldValue(field?.key) || [];
                if (!Array.isArray(currentFiles)) {
                  currentFiles = [currentFiles];
                }
                console.log("Before Remove:", currentFiles);
                const updatedFiles = currentFiles.filter((f) => f.url !== file.response?.url);
                console.log("Updated Files After Removal:", updatedFiles);
                handleInputChange(field?.key, updatedFiles, true);
                form.setFieldsValue({ [field?.key]: updatedFiles });
              }}


              defaultFileList={
                Array.isArray(formValues?.[field?.key])
                  ? formValues[field.key].map((fileObj, index) => ({
                    uid: index.toString(), // Unique identifier
                    name: fileObj.name || decodeURIComponent(fileObj.url?.match(/[^/]+$/)?.[0] || ""), // File name
                    url: fileObj.url, // File URL
                    status: "done", // Mark as uploaded
                  }))
                  : []
              }
            >
              <AntDButton icon={<UploadOutlined />} disabled={field.disabled}>
                {field.label}
              </AntDButton>
            </Upload>
          </Form.Item>
        );

      case "chat":
        return (
          <Form.Item
            label={field.label}
            name={field.key}
            rules={[
              { required: field.required, message: `${field.label} is required` },
            ]}
            {...(
              field?.tooltip?.trim().length > 0
                ? { tooltip: { title: field.tooltip.trim(), icon: <InfoCircleOutlined /> } }
                : {}
            )}
          >
            <Chat
              currentUser={{ id: user._id, name: user.name, profilePicture: user.profilePicture }}
              chatHistory={chatHistory}
              setChatHistory={setChatHistory}
            />
          </Form.Item>
        );


      case "dropdownFromAPI":
        return (
          <Form.Item
            label={field.label}
            name={field.key}
            rules={[
              // { required: field.required, message: `${field.label} is required` },
              {
                validator: (_, value) =>
                  field.required && (!MultiSelectListAPI || MultiSelectListAPI.length === 0)
                    ? Promise.reject(new Error(`${field.label} is required`))
                    : Promise.resolve(),
              },
            ]}
            {...(
              field?.tooltip?.trim().length > 0
                ? { tooltip: { title: field.tooltip.trim(), icon: <InfoCircleOutlined /> } }
                : {}
            )}
            initialValue={isUpdate ? (formValues[field.key] || '') : ((field.disabledWithDefaultValue || field.fillDefaultValue) ? eval(field.defaultValue) : field.defaultValue)}          >
            <MultiSelectPicker setMultipleSelectKey={setMultipleSelectKeyAPI} mode={field?.allowMultipleSelection ? "multiple" : "single"} apiHeader={field?.apiHeader} apiUrl={field.apiUrl} setMultiSelectList={setMultiSelectListAPI} MultiSelectList={isUpdate ? formValues[field.key] : MultiSelectListAPI} tableName={field.refTableName} labelName={field.refLabelName} valueName={field?.refValueField} field={field} />
          </Form.Item>)

      case "weeklyOffTable":
        return (
          <Form.Item
            label={field.label}
            name={field.key}
            {...(
              field?.tooltip?.trim().length > 0
                ? { tooltip: { title: field.tooltip.trim(), icon: <InfoCircleOutlined /> } }
                : {}
            )}
          >
            <WeeklyOffTable
              initialWeeklyOffData={weeklyOffDays}
              isHalfWorkingDay={field.needDropdownInTable}
              setOffDays={setWeeklyOffDays}
            />
          </Form.Item>)

      case "approvalChain":
        return (
          <Form.Item
            label={field.label}
            name={field.key}
            rules={[
              { required: field.required, message: `${field.label} is required` },
            ]}
            {...(
              field?.tooltip?.trim().length > 0
                ? { tooltip: { title: field.tooltip.trim(), icon: <InfoCircleOutlined /> } }
                : {}
            )}
          >
            <ApprovalChainBuilder
              // disabled={field.disabled || disabledRule || field.disabledWithDefaultValue}
              id={field.key}
              // approvalChainKey={approvalChainKey}
              setApprovalChainKey={setApprovalChainKey}
              field={field}
              setApprovalChainList={setApprovalChainList}
              approvalChainList={isUpdate ? formValues[field.key] : approvalChainList}
            />
          </Form.Item>
        );

      case "projectAllocations":
        return (
          <Form.Item
            label={field.label}
            name={field.key}
            {...(
              field?.tooltip?.trim().length > 0
                ? { tooltip: { title: field.tooltip.trim(), icon: <InfoCircleOutlined /> } }
                : {}
            )}
          >
            <ProjectAllocation
              setProjectAllocations={setProjectAllocations}
              projectAllocations={projectAllocations}
            />
          </Form.Item>
        );

      case "flow":
        return (

          <Form.Item
            label={field.label}
            name={field.key}
            rules={[
              { required: field.required, message: `${field.label} is required` },
            ]}
            {...(
              field?.tooltip?.trim().length > 0
                ? { tooltip: { title: field.tooltip.trim(), icon: <InfoCircleOutlined /> } }
                : {}
            )}
          >

            <DND
              field={field}
              sendDataToParent={(data) => {
                handleDataFromChild(data, field); // Update the parent state
                form.setFieldsValue({ [field.key]: data }); // Update the form values
              }}
              defaultValue={isUpdate ? (() => {
                try {
                  if (typeof formValues[field.key] === "string") {
                    return JSON.parse(formValues[field.key]);
                  } else if (
                    Array.isArray(formValues[field.key]) ||
                    typeof formValues[field.key] === "object"
                  ) {
                    return formValues[field.key];
                  } else {
                    return [];
                  }
                } catch (error) {
                  console.error(
                    "Error parsing formValues[field.key]:",
                    formValues[field.key],
                    error
                  );
                  return [];
                }
              })() : undefined}
              isUpdate={isUpdate}
            />
          </Form.Item>
        );

      default:
        return null;
    }
  };
  const handleSubmitonboard = async (values) => {
    setIsLoading(true);
    let updatedValues = { ...values };
    var response;
    try {
      response = await axios.post(
        `${import.meta.env.VITE_API_URI}/api/dynamic/${tableName}`,
        updatedValues,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      console.log("API Response:", response.data); // ✅ Log full API response
      toast.success(response.data.message || "Form submitted successfully!"); // ✅ Show response message

      console.log("Saved Data:", updatedValues);
      setSavedData(updatedValues);

      // Extract the insertedId (employeeId) from the response
      const employeeId = response.data.data.insertedId;
      console.log("Employee ID (insertedId):", employeeId); // Debugging

      // Pass the updatedValues and employeeId to the parent component
      onSubmit({ ...updatedValues, employeeId }); // ✅ Move to the next step
    } catch (error) {
      console.error("Submission Error:", error?.response?.data?.message);
      if (!error?.response?.data?.success) {

        toast.error(error?.response?.data?.message, "Error submitting form.");
      } else {

        toast.error(response?.message, "Error submitting form.");
      }

    } finally {
      setIsLoading(false);
    }
  };

  const getDisabledDate = (fieldKey, currentDate) => {
    console.log('Field Key:', fieldKey); // Debugging log
    const today = dayjs().startOf('day'); // Get today's date at the start of the day

    if (fieldKey === 'disbursementStartDate') {
      // Disable dates before today and after today + 20 days
      return currentDate.isBefore(today) || currentDate.isAfter(today.add(20, 'day'));
    }

    if (fieldKey === 'emiStartDate') {
      // Disable dates before today and after today + 30 days
      return currentDate.isBefore(today) || currentDate.isAfter(today.add(30, 'day'));
    }

    // Default: no dates are disabled
    return false;
  };


  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center', // Center horizontally
        alignItems: 'center', // Center vertically
        height: '60vh' // Full viewport height to center in the middle of the screen
      }}>
        <CircularProgress />
      </div>
    );
  }

  if (!formData) {
    return <div style={{
      display: 'flex',
      justifyContent: 'center', // Center horizontally
      alignItems: 'center', // Center vertically
      height: '60vh' // Full viewport height to center in the middle of the screen
    }}>
      <CircularProgress />
    </div>
  }
  const handleTabChange = (key) => {
    setActiveTab(key);  // Assuming selectedTab is state to track the current tab
  };
  return (

    <div>

      {/* Grid Container */}
      <Dropdown menu={{ items }} trigger={['contextMenu']} >
        <div>
          <Grid container spacing={1} style={{ padding: "10px", maxWidth: !isMobile ? '70%' : '100%', margin: 'auto' }}>
            {/* <Button type="secondary" size='large' shape="circle" style={{marginLeft : "auto"}} icon={<MoreOutlined />} /> */}
            {/* <Dropdown  menu={{ items : customActions }} trigger={['click']}>
            <a style={{ marginLeft : !isMobile ? "100%" : "none"}} onClick={e => e.preventDefault()}>
              <Space>
              <MoreOutlined style={{fontSize : "25px"}}/>
              </Space>
            </a>
          </Dropdown> */}

            <Grid item xs={12} md={12}>

              {/* Check if mappedFormData is available */}
              {Array.isArray(mappedFormData) && mappedFormData.length > 0 ? (
                mappedFormData.length === 1 ? (
                  <div>
                    {/* <Dropdown menu={{ items }} trigger={['contextMenu']}> */}
                    <Form
                      form={form}
                      layout="vertical"
                      onFinish={(values) => onboarding ? handleSubmitonboard(values) : handleSubmit(false, values)}
                      scrollToFirstError
                      onValuesChange={formValuesOnChange}
                    >
                      <Row gutter={[16, 16]}>
                        {mappedFormData[0].fields.map((field, index) =>
                          !field.viewOnlyOnUpdate || isUpdate ? (
                            <Col xs={24} sm={field.fullWidthField ? 24 : 12} key={index}
                              style={{ display: field.visibility ? "block" : "none" }}>
                              {isUpdate ? formValues && renderField(field) : renderField(field)}
                            </Col>
                          ) : null
                        )}
                      </Row>
                    </Form>
                  </div>
                ) : (
                  <div style={{ display: 'flex', justifyContent: 'center', flexDirection: 'column', alignItems: 'center' }}>
                    <Segmented
                      options={mappedFormData.map((e) => ({
                        label: e.section === "Others" ? "General" : e.section.charAt(0).toUpperCase() + e.section.slice(1),
                        value: e.section,
                      }))}
                      value={activeTab}
                      onChange={setActiveTab}
                      style={{
                        backgroundColor: '#f0f5ff',
                        padding: '4px',
                        width: 'fit-content',
                        marginBottom: '50px',
                      }}
                    />

                    {mappedFormData.map((e) => (

                      <div key={e.section} style={{ display: e.section === activeTab ? 'block' : 'none' }}>
                        <Dropdown menu={{ items }} trigger={['contextMenu']}>
                          <Form
                            form={form}
                            layout="vertical"
                            onFinish={(values) => onboarding ? handleSubmitonboard(values) : handleSubmit(false, values)}
                            scrollToFirstError
                            onValuesChange={formValuesOnChange}
                            loading={isLoading}
                          >
                            <Row gutter={[16, 8]}>
                              {e.fields.map((field, index) =>
                                !field.viewOnlyOnUpdate || isUpdate ? (
                                  <Col xs={24} sm={field.fullWidthField ? 24 : 12} key={index}
                                    style={{ display: field.visibility ? "block" : "none" }}
                                  >
                                    {isUpdate ? formValues && renderField(field) : renderField(field)}
                                  </Col>
                                ) : null
                              )}
                            </Row>
                          </Form>
                        </Dropdown>
                      </div>
                    ))}
                  </div>
                )
              ) : (
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
                  <CircularProgress />
                </div>
              )}

              {/* Alert Component - Only shown when alertMessage is not null */}
              {alertMessage && (
                <Alert
                  message={alertMessage?.title}
                  description={alertMessage?.description}
                  type={alertMessage?.type || "info"}
                  showIcon
                  // closable
                  onClose={() => setAlertMessage(null)}
                  style={{ marginTop: "20px", marginBottom: "10px" }}
                />
              )}

              <div style={{ marginTop: "20px" }}>
                {onboarding ? (
                  <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "20px" }}>
                    {mappedFormData && activeTab === mappedFormData[mappedFormData?.length - 1].section ? (
                      <Popconfirm
                        title="Warning: Proceed with caution"
                        description="Are you sure you want to proceed to the next step after submission can't be undone?"
                        onConfirm={async () => {
                          try {
                            await form.validateFields();
                            form.submit();
                          } catch (error) {
                            toast.error("Please fill in all required fields.");
                          }
                        }}
                        placement="topRight"
                      >
                        <Button id="submitButton" type="primary" loading={isLoading}>
                          {currentStep === totalSteps - 1 ? "Finish" : "Next"}
                        </Button>
                      </Popconfirm>
                    ) : null}
                  </div>
                ) : (
                  <>
                    {canUpdate && isUpdate && !cannotCreateDirectly && !isView && (
                      <Popconfirm
                        title="Warning: Proceed with caution"
                        description="Are you sure you want to proceed?"
                        onConfirm={async () => {
                          try {
                            await form.validateFields();
                            form.submit();
                          } catch (error) {
                            toast.error("Please fill in all required fields.");
                          }
                        }}
                        placement="topRight"
                      >
                        <Button type="primary" style={{ marginRight: "10px" }} loading={isLoading}>
                          {statusButtonMapping[status] || "Update"}
                        </Button>
                      </Popconfirm>
                    )}
                    {canCreate && !isUpdate && !cannotCreateDirectly && !isView && (
                      <Popconfirm
                        title="Warning: Proceed with caution"
                        description="Are you sure you want to proceed?"
                        onConfirm={async () => {
                          try {
                            await form.validateFields();
                            form.submit();
                          } catch (error) {
                            toast.error("Please fill in all required fields.");
                          }
                        }}
                        placement="topRight"
                      >
                        <Button
                          type="primary"
                          style={{ marginRight: "10px" }}
                          loading={isLoading}
                          name="submitButton"
                          ref={buttonRef} // Attach the ref
                          disabled={isSubmitDisabled}
                        >
                          {stepper ? "Save" : (statusButtonMapping[status] || "Submit")}
                        </Button>

                      </Popconfirm>
                    )}
                    {(!stepper) && (<Popconfirm
                      title="Warning: Proceed with caution"
                      description="Are you sure you want to go back?"
                      onConfirm={handleBackButtonClick}
                      placement="topRight"
                    >
                      <Button type="primary" style={{ background: '#000' }}>Back</Button>
                    </Popconfirm>)}
                  </>
                )}
              </div>
            </Grid>
          </Grid>
        </div>
      </Dropdown>
      <div >
        <RelatedLinks jsonString={formData?.relatedLinks} ></RelatedLinks>
      </div>
      {(!isModal && isUpdate && formData.enableRelatedList && globalPermissions?.includes(`${formData?.tableName}.relatedLists`)) && (
        <> <Divider />


          <br />
          <div style={{ marginBottom: '20px' }}>{console.log("formValues", formData)}
            <RelatedLists lists={JSON.parse(formData?.relatedList)} fieldData={formValues} parentTable={formData?.tableName} />
          </div>
        </>
      )}

      <Drawer
        title="History"
        placement={placement}
        closable={true}
        onClose={onClose}
        open={open}
        width={isMobile ? '100%' : '60%'}
      >
        <Grid style={{ display: 'flex', flexDirection: 'column' }}>
          {/* {history?.length !== 0 && (
            <Title style={{ marginLeft: "auto", marginRight: "auto" }} level={3}>
              History
            </Title>
          )} */}

          {drawerSpinner ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
              <Spin size="large" />
            </div>
          ) : (
            history && history.length > 0 ? (
              history.map((action) =>
                <ActivityCard
                  key={action.id}
                  activity={action}
                  userProfile={userProfileData}
                />
              )
            ) : (
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '40px',
                color: '#999'
              }}>
                <div style={{ fontSize: '64px', marginBottom: '16px' }}>
                  <InboxOutlined />
                </div>
                <p>No history data available</p>
              </div>
            )
          )}
        </Grid>
      </Drawer>

      {isUpdate && (<FloatButton
        shape="circle"
        type="primary"
        style={{
          insetInlineEnd: 50,
          insetBlockEnd: 80, // Adds vertical space from the bottom
        }}
        onClick={showDrawer}
        icon={<HistoryOutlined />}
        tooltip="View History"
      />)}
    </div>

  );


};

export default DynamicForm;