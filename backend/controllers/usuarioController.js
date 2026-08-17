import bcrypt from "bcryptjs";
import Sequelize from "sequelize";
import db from "../models/index.js";

import encryptHelper from "../utils/encryptHelper.js";
import CRUDController from "./CRUDController.js";
import functionHelper from "./db/functionHelper.js";

const { Usuarios, catTiposUsuarios, catDelegacion, catEstado } = db;
const { Op } = Sequelize;

const { handleIsAdmin, getAllFromModel } = functionHelper;
const { validateRecord, createRecord, updateRecord, processSoftDelete } =
  CRUDController;
const { createShortToken, verifyShortToken } = encryptHelper;

const Coordis = [3, 5, 7];

/**
 * ==============================
 * VALIDACIONES Y HELPERS
 * ==============================
 */

function validateUserData(data) {
  if (!data.nombre || !data.correo || !data.tipo || !data.tipo.id) {
    return {
      result: false,
      message: "Faltan campos requeridos",
      data: [],
    };
  }
  return { result: true };
}

async function transformUserData(data) {
  data.estatus =
    data.estatus === "Activo" ||
    data.estatus === true ||
    data.estatus === "true"
      ? 1
      : 0;

  data.tipo_id = data.tipo.id;
  delete data.tipo;

  if (data.estado) {
    data.estado_id = data.estado.id;
    delete data.estado;
  }
  if (data.municipio) {
    data.municipio_id = data.municipio.id;
    delete data.municipio;
  }
  if (data.delegacion) {
    data.delegacion_id = data.delegacion.id;
    delete data.delegacion;
  }

  if (data.password) {
    data.password = await bcrypt.hash(data.password, 10);
  }

  return data;
}

async function saveUser(data) {
  try {
    const isCreate = !data.id;

    const validation = validateUserData(data);
    if (!validation.result) return validation;

    const existeCorreo = await validateRecord("Usuarios", {
      correo: data.correo,
      ...(data.id && { id: { [Op.ne]: data.id } }),
    });

    if (!existeCorreo.result) {
      return {
        result: false,
        message: "El correo ya está en uso",
        data: [],
      };
    }

    data = await transformUserData(data);

    console.log(data);

    const Coordis = [3, 5, 7];

    if (Coordis.includes(data.tipo_id)) {
      let message = "Ya existe un Coordinador Nacional";
      let filtro = {
        tipo_id: data.tipo_id,
      };

      if (data.tipo_id >= 5) {
        filtro.estado_id = data.estado_id;
        message = "Ya existe un Coordinador Estatal en este estado";
      }

      if (data.tipo_id == 7) {
        filtro.delegacion_id = data.delegacion_id;
        message = "Ya existe un Coordinador Local en esta delegación";
      }

      console.log("==> Filtros: ", filtro);

      const existeRegistro = await validateRecord("Usuarios", filtro);

      if (!existeRegistro.result) {
        return {
          result: false,
          message,
          data: [],
        };
      }
    }

    const usuario = isCreate
      ? await createRecord("Usuarios", data)
      : await updateRecord("Usuarios", data);

    return {
      result: true,
      message: isCreate
        ? "Registro creado con éxito"
        : "Registro actualizado con éxito",
      data: usuario,
    };
  } catch (e) {
    return {
      result: false,
      message: "Error al guardar el registro: " + e.message,
      data: [],
    };
  }
}

/**
 * ==============================
 * CONTROLLERS
 * ==============================
 */

const getAll = async (req, res) => {
  try {
    const paranoid = !handleIsAdmin(req);
    const filtros = req.body.filtros || {};
    const page = parseInt(req.body.page) || 1;
    const pageSize = parseInt(req.body.pageSize) || 10;

    const attributes = [
      "id",
      "nombre",
      "correo",
      "tipo_id",
      "estatus",
      "created_at",
      "updated_at",
      "deleted_at",
    ];

    const include = [
      {
        model: catTiposUsuarios,
        as: "tipo",
        attributes: ["id", "label"],
      },
      {
        model: catEstado,
        as: "estado",
        attributes: ["id", "label"],
      },
      {
        model: catDelegacion,
        as: "delegacion",
        attributes: ["id", "label"],
      },
    ];

    const response = await getAllFromModel({
      model: Usuarios,
      filtros,
      attributes,
      include,
      page,
      pageSize,
      paranoid,
    });

    return res.json(response);
  } catch (error) {
    console.log("Error en getAll:", error);
    return res.json({
      result: false,
      message: "Error al obtener usuarios",
      data: [],
    });
  }
};

const getUser = async (req, res) => {
  const { id } = req.params;

  try {
    const usuario = await Usuarios.findOne({
      where: { id },
      attributes: ["id", "nombre", "correo", "tipo_id", "estatus"],
      include: [
        {
          model: catTiposUsuarios,
          as: "tipo",
          attributes: ["id", "label"],
        },
      ],
    });

    if (!usuario) {
      return res.json({
        result: false,
        message: "Usuario no encontrado",
      });
    }

    return res.json({
      result: true,
      message: "Usuario obtenido con éxito",
      data: usuario,
    });
  } catch (error) {
    console.log("Error al obtener usuario:", error);
    return res.json({
      result: false,
      message: "Error al obtener usuario",
    });
  }
};

const createOrUpdate = async (req, res) => {
  const response = await saveUser(req.body);
  if (response.data) delete response.data;
  res.json(response);
};

const remove = async (req, res) => {
  const { id } = req.body;

  if (!id) {
    return res.json({
      result: false,
      message: "ID de usuario es requerido",
    });
  }

  const response = await updateRecord("Usuarios", { id, estatus: 0 });
  res.json(response);
};

const softDelete = async (req, res) => {
  const { id } = req.body;

  if (!id) {
    return res.json({
      result: false,
      message: "ID de usuario es requerido",
    });
  }

  const response = await processSoftDelete(Usuarios, id);
  res.json(response);
};

const cambiarContrasenia = async (req, res) => {
  const { id, contrasenia } = req.body;

  if (!id || !contrasenia) {
    return res.json({
      result: false,
      message: "ID y contraseña requeridos",
    });
  }

  const user = await Usuarios.findByPk(id);
  if (!user) {
    return res.json({
      result: false,
      message: "Usuario no encontrado",
    });
  }

  const hashedPassword = await bcrypt.hash(contrasenia, 10);
  await updateRecord("Usuarios", { id, password: hashedPassword });

  res.json({
    result: true,
    message: "Contraseña actualizada con éxito",
  });
};

const restablecer = async (req, res) => {
  const { correo, password, token } = req.body;

  if (!password) {
    const usuario = await Usuarios.findOne({ where: { correo } });
    if (!usuario) {
      return res.json({
        result: false,
        message: "No se encontró un usuario con ese correo",
      });
    }

    const reset_token = createShortToken(2).toUpperCase();
    await updateRecord("Usuarios", { id: usuario.id, reset_token });

    return res.json({
      result: true,
      message: "Solicitud de restablecimiento enviada",
    });
  }

  const tokenData = verifyShortToken(token);
  if (!tokenData.result) {
    return res.json({
      result: false,
      message: "Token inválido o expirado",
    });
  }

  const usuario = await Usuarios.findOne({ where: { correo } });
  if (!usuario) {
    return res.json({
      result: false,
      message: "Usuario no encontrado",
    });
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  await updateRecord("Usuarios", {
    id: usuario.id,
    password: hashedPassword,
    reset_token: "",
  });

  res.json({
    result: true,
    message: "Contraseña restablecida con éxito",
  });
};

const confirmar = async (req, res) => {
  const { token } = req.params;

  const tokenData = verifyShortToken(token);
  if (!tokenData.result) {
    return res.json({
      result: false,
      message: "Token inválido o expirado",
    });
  }

  const usuario = await Usuarios.findOne({ where: { reset_token: token } });
  if (!usuario) {
    return res.json({
      result: false,
      message: "Token inválido o usuario no encontrado",
    });
  }

  res.json({
    result: true,
    message: "Usuario confirmado con éxito",
    data: usuario,
  });
};

/**
 * ==============================
 * EXPORT DEFAULT
 * ==============================
 */

export default {
  getAll,
  getUser,
  createOrUpdate,
  delete: remove,
  softDelete,
  cambiarContrasenia,
  restablecer,
  confirmar,
};
