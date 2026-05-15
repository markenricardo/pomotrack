import React from 'react';
import './SaveModal.css';

interface SaveModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  message?: string;
}

const SaveModal: React.FC<SaveModalProps> = ({ 
  isOpen, 
  onClose,
  title = "Changes Saved!",
  message = "Your profile settings have been updated successfully."
}) => {

  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="save-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-close" onClick={onClose}>
          <span></span>
          <span></span>
        </div>
        <div className="modal-icon">
          <div className="checkmark"></div>
        </div>
        <div className="modal-title">{title}</div>
        <div className="modal-message">{message}</div>
      </div>
    </div>
  );
};

export default SaveModal;