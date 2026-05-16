import React from 'react';
import { LogOut } from 'lucide-react';
import './LogoutModal.css';

interface LogoutModalProps {
  onClose: () => void;
  onConfirm: () => void;
}

const LogoutModal = ({ onClose, onConfirm }: LogoutModalProps) => {
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="logout-modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-content-frame">
          <div className="logout-icon-bg">
            <LogOut size={24} color="#FFFFFF" />
          </div>
          <p className="logout-title">Are you sure you want to log out?</p>
          <div className="button-container">
            <button className="btn-cancel" onClick={onClose}>
              <span>Cancel</span>
            </button>
            <button className="btn-logout" onClick={onConfirm}>
              <span>Log Out</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LogoutModal;