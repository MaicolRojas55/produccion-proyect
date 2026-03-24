import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import BotonRegistro from './BotonRegistro';

describe('BotonRegistro - Componente CONIITI', () => {
  it('debe existir y renderizarse correctamente', () => {
    render(<BotonRegistro />);
    const boton = screen.getByTestId('boton-registro');
    expect(boton).toBeDefined();
  });

  it('debe tener texto visible', () => {
    render(<BotonRegistro />);
    const boton = screen.getByTestId('boton-registro');
    expect(boton.textContent).toBeTruthy();
    expect(boton.textContent).toContain('CONIITI');
  });

  it('debe ser un elemento de tipo botón', () => {
    render(<BotonRegistro />);
    const boton = screen.getByRole('button');
    expect(boton).toBeDefined();
  });
});