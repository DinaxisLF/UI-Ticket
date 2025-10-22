import React, { useState, useEffect, createContext, useContext } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [usersDB, setUsersDB] = useState([]);

  // Load initial data from localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const storedUsers = localStorage.getItem("usersDB");

    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }

    if (storedUsers) {
      setUsersDB(JSON.parse(storedUsers));
    } else {
      // Usuario demo por defecto (cumple con el formato requerido)
      const demoUser = {
        id: 1,
        username: "ABCD900101HDFRRLJO1", // Formato CURP + 2 letras estado + 1 número
        name: "Usuario Demo",
        email: "demo@example.com",
        password: "QwErTy9!", // Cumple con los requisitos de contraseña
      };
      setUsersDB([demoUser]);
      localStorage.setItem("usersDB", JSON.stringify([demoUser]));
    }

    setLoading(false);
  }, []);

  const login = async (username, password) => {
    setLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    const userFound = usersDB.find(
      (u) => u.username === username && u.password === password
    );

    if (userFound) {
      const { password, ...userWithoutPassword } = userFound;
      setUser(userWithoutPassword);
      localStorage.setItem("user", JSON.stringify(userWithoutPassword));
      setLoading(false);
      return { success: true, message: "Inicio de sesión exitoso" };
    } else {
      setLoading(false);
      return { success: false, message: "Credenciales incorrectas" };
    }
  };

  const register = async (userData) => {
    setLoading(true);
    // Simular delay de red
    await new Promise((resolve) => setTimeout(resolve, 1000));

    // Verificar si el usuario ya existe
    const userExists = usersDB.find(
      (user) => user.username === userData.username
    );

    if (userExists) {
      setLoading(false);
      return { success: false, message: "El usuario ya existe" };
    }

    // Agregar nuevo usuario
    const newUser = {
      id: Date.now(),
      username: userData.username,
      name: userData.name,
      email: userData.email,
      password: userData.password,
    };

    const updatedUsersDB = [...usersDB, newUser];
    setUsersDB(updatedUsersDB);

    // Eliminar password del objeto usuario antes de guardarlo
    const { password, ...userWithoutPassword } = newUser;
    setUser(userWithoutPassword);
    localStorage.setItem("user", JSON.stringify(userWithoutPassword));

    setLoading(false);
    return { success: true, message: "Usuario registrado exitosamente" };
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};
