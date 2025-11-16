// ../components/ErrorModal.jsx
import React, { useState, useEffect } from "react";

const ErrorModal = ({ isOpen, title, text, onClose }) => {
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
      onClick={onClose}
    >
      <div
        className="bg-white text-gray-900 p-5 rounded-xl w-full max-w-md mx-4 shadow-xl text-center font-sans"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-lg font-semibold mb-2 text-gray-900">{title}</h3>
        <p className="text-gray-600 mb-4 leading-relaxed">{text}</p>
        <button
          onClick={onClose}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
        >
          Cerrar
        </button>
      </div>
    </div>
  );
};

// Hook implementation
export const useErrorModal = () => {
  const [modalState, setModalState] = useState({
    isOpen: false,
    title: "",
    text: "",
  });

  const showErrorModal = (title, text) => {
    setModalState({ isOpen: true, title, text });
  };

  const closeModal = () => {
    setModalState((prev) => ({ ...prev, isOpen: false }));
  };

  const ModalComponent = () => (
    <ErrorModal
      isOpen={modalState.isOpen}
      title={modalState.title}
      text={modalState.text}
      onClose={closeModal}
    />
  );

  return { showErrorModal, ModalComponent };
};

export default ErrorModal;
