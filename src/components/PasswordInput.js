import React, { useState } from 'react';
import { Form, InputGroup } from 'react-bootstrap';
import { FaEye, FaEyeSlash } from 'react-icons/fa';

const PasswordInput = ({ value, onChange, placeholder }) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <InputGroup className="mb-3">
      <Form.Control
        type={showPassword ? 'text' : 'password'}
        placeholder={placeholder || 'Enter password'}
        value={value}
        onChange={onChange}
        required
      />
      <InputGroup.Text 
        onClick={() => setShowPassword(!showPassword)}
        style={{ 
          cursor: 'pointer',
          userSelect: 'none',
          backgroundColor: '#f8f9fa',
          borderLeft: 'none'
        }}
      >
        {showPassword ? (
          <FaEyeSlash style={{ fontSize: '1.2em', color: '#6c757d' }} />
        ) : (
          <FaEye style={{ fontSize: '1.2em', color: '#6c757d' }} />
        )}
      </InputGroup.Text>
    </InputGroup>
  );
};

export default PasswordInput; 