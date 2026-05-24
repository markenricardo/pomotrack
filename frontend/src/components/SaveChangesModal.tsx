import React from 'react';
import './SaveChangesModal.css';

interface SaveModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SaveModal: React.FC<SaveModalProps> = ({ isOpen, onClose }) => {
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
        <div className="modal-title">Changes Saved!</div>
        <div className="modal-message">Your profile settings have been updated successfully.</div>
      </div>
    </div>
  );
};

export default SaveModal;