import React from 'react';

interface BotonRegistroProps {
  onClick?: () => void;
}

const BotonRegistro = ({ onClick }: BotonRegistroProps) => {
  return (
    <button
      onClick={onClick}
      className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg transition-colors"
      data-testid="boton-registro"
    >
      Registrarse en CONIITI
    </button>
  );
};

export default BotonRegistro;