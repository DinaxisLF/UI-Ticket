// Lista de códigos de estado válidos
const stateCodes = [
  "AS",
  "BC",
  "BS",
  "CC",
  "CL",
  "CM",
  "CS",
  "CH",
  "DF",
  "DG",
  "GT",
  "GR",
  "HG",
  "JO",
  "MC",
  "MN",
  "MS",
  "NT",
  "NL",
  "OC",
  "PL",
  "QT",
  "QR",
  "SP",
  "SL",
  "SR",
  "TC",
  "TS",
  "TL",
  "VZ",
  "YN",
  "ZS",
];

// Función para validar el formato de usuario
export const validateUsername = (username) => {
  if (username.includes(" ")) {
    return { isValid: false, message: "El usuario no debe contener espacios" };
  }

  if (/^[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(username)) {
    return {
      isValid: false,
      message: "El usuario no puede comenzar con un carácter especial",
    };
  }

  if (username.length !== 19) {
    return {
      isValid: false,
      message: `El usuario debe tener exactamente 19 caracteres. Longitud actual: ${username.length}`,
    };
  }

  // Debe estar en MAYÚSCULAS
  if (username !== username.toUpperCase()) {
    return { isValid: false, message: "El usuario debe estar en MAYÚSCULAS" };
  }

  // No debe contener espacios
  if (/\s/.test(username)) {
    return { isValid: false, message: "El usuario no puede contener espacios" };
  }

  // No debe iniciar ni terminar con caracteres especiales
  if (!/^[A-Z]/.test(username) || !/[0-9]$/.test(username)) {
    return {
      isValid: false,
      message: "El usuario debe iniciar con letra y terminar con número",
    };
  }

  // Validar cada parte del formato explícitamente
  const part1 = username.substring(0, 4); // 4 Letras
  const part2 = username.substring(4, 10); // 6 Números
  const part3 = username.substring(10, 11); // 1 Letra
  const part4 = username.substring(11, 13); // 2 Letras
  const part5 = username.substring(13, 16); // 3 Letras/Números
  const part6 = username.substring(16, 18); // 2 Letras del Estado
  const part7 = username.substring(18, 19); // 1 Número

  // Validar cada parte
  if (!/^[A-Z]{4}$/.test(part1)) {
    return { isValid: false, message: "Primera parte (4 letras) inválida" };
  }

  if (!/^\d{6}$/.test(part2)) {
    return { isValid: false, message: "Segunda parte (6 números) inválida" };
  }

  if (!/^[A-Z]$/.test(part3)) {
    return { isValid: false, message: "Tercera parte (1 letra) inválida" };
  }

  if (!/^[A-Z]{2}$/.test(part4)) {
    return { isValid: false, message: "Cuarta parte (2 letras) inválida" };
  }

  if (!/^[A-Z0-9]{3}$/.test(part5)) {
    return {
      isValid: false,
      message: "Quinta parte (3 letras/números) inválida",
    };
  }

  if (!stateCodes.includes(part6)) {
    return { isValid: false, message: `Código de estado "${part6}" inválido` };
  }

  if (!/^\d{1}$/.test(part7)) {
    return { isValid: false, message: "Séptima parte (1 número) inválida" };
  }

  return { isValid: true, message: "" };
};

// Función para validar la contraseña
export const validatePassword = (password) => {
  // Longitud exacta de 8 caracteres
  if (password.length !== 8) {
    return {
      isValid: false,
      message: "La contraseña debe tener al menos 8 caracteres",
    };
  }

  // Debe contener al menos: una mayúscula, una minúscula, un número y un carácter especial
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecialChar = /[@#$%&!¡¿?]/.test(password);

  if (!hasUpperCase) {
    return {
      isValid: false,
      message: "La contraseña debe contener al menos una letra mayúscula",
    };
  }

  if (!hasLowerCase) {
    return {
      isValid: false,
      message: "La contraseña debe contener al menos una letra minúscula",
    };
  }

  if (!hasNumber) {
    return {
      isValid: false,
      message: "La contraseña debe contener al menos un número",
    };
  }

  if (!hasSpecialChar) {
    return {
      isValid: false,
      message:
        "La contraseña debe contener al menos un carácter especial (@, #, $, %, &)",
    };
  }

  return { isValid: true, message: "" };
};

// Función para validar el formato del nombre
export const validateName = (name) => {
  // No puede estar vacío
  if (!name || name.trim().length === 0) {
    return { isValid: false, message: "El nombre es requerido" };
  }

  // Longitud mínima
  if (name.length < 2) {
    return {
      isValid: false,
      message: "El nombre debe tener al menos 2 caracteres",
    };
  }

  // No debe contener números
  if (/\d/.test(name)) {
    return { isValid: false, message: "El nombre no puede contener números" };
  }

  // No debe contener caracteres especiales (excepto espacios y apóstrofes)
  if (/[^a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s']/.test(name)) {
    return {
      isValid: false,
      message: "El nombre no puede contener caracteres especiales",
    };
  }

  // Debe contener al menos un espacio (nombre y apellido)
  if (!/\s/.test(name)) {
    return { isValid: false, message: "Por favor ingresa nombre y apellido" };
  }

  // Validar que no tenga espacios múltiples o al inicio/fin
  if (name !== name.trim() || /\s{2,}/.test(name)) {
    return {
      isValid: false,
      message:
        "El nombre no debe tener espacios al inicio/fin o múltiples espacios",
    };
  }

  return { isValid: true, message: "" };
};
