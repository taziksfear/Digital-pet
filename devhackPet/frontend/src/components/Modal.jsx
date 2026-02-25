import React from 'react';

export default function Modal({ isOpen, title, onClose, children }) {
    return (
        <div className={`modal ${isOpen ? 'open' : ''}`}>
            <div className="modal-header">
                <h3>{title}</h3>
                <button className="close-btn" onClick={onClose}>✖</button>
            </div>
            <div className="modal-content">
                {children}
            </div>
        </div>
    );
}