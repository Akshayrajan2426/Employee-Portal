import { useEffect, useState } from 'react';
import { Modal } from 'antd';
import DynamicForm from './DynamicForm'; // Make sure to import this correctly

const DynamicFormModal = ({
    title,
    tableName,
    objectId,
    isView,
    isUpdate,
    onClose,
    initialVisibility // Optional prop to control initial visibility
}) => {
    const [isVisible, setIsVisible] = useState(initialVisibility);
    useEffect(()=>{
        setIsVisible(initialVisibility);
    },[initialVisibility])
    const handleClose = () => {
        setIsVisible(false); // Close the modal
        if (onClose) onClose(); // Call external onClose if provided
    };

    return (
        <Modal
            title={title}
            open={isVisible}
            onCancel={handleClose}
            footer={null}
            destroyOnClose={true}
            width={'70%'}
        >
            <DynamicForm
                isUpdate={isUpdate}
                propRendering={true}
                tableName={tableName}
                objectId={objectId}
                isView={isView}
                isModal={true}
                handleClose = {handleClose}
            />
        </Modal>
    );
};

export default DynamicFormModal;
