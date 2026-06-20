import db from "../../models/index.js";
import CRUDController from "../CRUDController.js";
const { Op } = db.Sequelize;
const { createRecord, updateRecord } = CRUDController;
const { Usuarios, Elementos, Unidades } = db;

const models = db;

const getRelaciones = async (relaciones) => {
  return relaciones
    .map((rel) => {
      switch (rel) {
        case "area":
          return {
            model: models.catAreas,
            as: "area",
            attributes: ["id", "label"],
          };
        case "cargo":
          return {
            model: models.catCargo,
            as: "cargo",
            attributes: ["id", "label"],
          };
        case "delegacion":
          return {
            model: models.catDelegacion,
            as: "delegacion",
            attributes: ["id", "label"],
          };
        case "estado":
          return {
            model: models.catEstado,
            as: "estado",
            attributes: ["id", "label"],
          };
        case "direccion":
          return {
            model: models.volDireccion,
            as: "direccion",
            include: [
              {
                model: models.catEstado,
                as: "estado",
                attributes: ["id", "label"],
              },
            ],
          };
        case "contactoEmergencia":
          return {
            model: models.volContactoEmergencia,
            as: "contactoEmergencia",
            attributes: ["id", "nombre", "id_parentesco", "telefono"],
            include: [
              {
                model: models.catParentesco,
                as: "parentesco",
                attributes: ["id", "label"],
              },
            ],
          };
        case "idiomas":
          return {
            model: models.volIdiomas,
            as: "idiomas",
            attributes: ["id", "nombre", "escrito", "hablado"],
          };
        case "profesionales":
          return {
            model: models.volDatosProfesionales,
            as: "profesionales",
            include: [
              {
                model: models.catGradoEstudios,
                as: "gradoEstudios",
                attributes: ["id", "label"],
              },
            ],
          };
        case "intereses":
          return {
            model: models.volIntereses,
            as: "intereses",
          };
        case "disponibilidad":
          return {
            model: models.volDisponibilidad,
            as: "disponibilidad",
            attributes: ["id", "nombre"],
          };
        case "direccion":
          return {
            model: models.volDireccion,
            as: "direccion",
            include: [
              {
                model: models.catEstado,
                as: "estado",
                attributes: ["id", "label"],
              },
            ],
          };
        case "estado_civil":
          return {
            model: models.catEstadoCivil,
            as: "estado_civil",
            attributes: ["id", "label"],
          };
        case "grupo_sanguineo":
          return {
            model: models.catGrupoSanguineo,
            as: "grupo_sanguineo",
            attributes: ["id", "label"],
          };
        case "nacionalidad":
          return {
            model: models.catNacionalidad,
            as: "nacionalidad",
            attributes: ["id", "label"],
          };
        default:
          return null;
      }
    })
    .filter(Boolean);
};

const getFiltrosForTipoUsuario = async (req) => {
  const userRole = req?.user ?? null;

  if (!userRole) {
    console.log(
      "getFiltrosForTipoUsuario: El objeto 'user' no está definido en la solicitud.",
    );
    return {};
  }

  if (typeof userRole.tipo_id === "undefined") {
    console.log(
      "getFiltrosForTipoUsuario: El atributo 'tipo_id' no está definido en el usuario.",
    );
    return {};
  }

  switch (userRole.tipo_id) {
    case 4: // Estatal
      // let estado
      return {
        estado_id: userRole.estado_id,
      };
    case 5: // Local
      return {
        delegacion_id: userRole.delegacion_id,
      };
  }
};
// prettier-ignore
const handleElementosAndUnidades = async (data, reporteId) => {
  if(!reporteId){
  }

  if(data.elementos && Array.isArray(data.elementos) && data.elementos.length > 0){
    let elementosToCreate = data.elementos;
    const filtros = {
      where: {
        numeroAsociado: {
          [Op.in]: elementosToCreate, // Solo IDs válidos
        },
      },
    };
    const elementosInBD = await Elementos.findAll(filtros);

    if(elementosInBD.length > 0 ){
      const numerosEnBD = elementosInBD.map((el) => el.numeroAsociado);
      elementosToCreate = elementosToCreate.filter(
        (num) => !numerosEnBD.includes(num)
      );
    }
    console.log("Elementos a crear: ", elementosToCreate.legth);
    elementosToCreate.forEach(async (item) => {
      const payload = {
        numeroAsociado: item,
        estado_id: data?.estado?.id ?? null,
        municipio_id: data?.municipio?.id ?? null,
        delegacion_id: data?.delegacion?.id ?? null,
      };
      await createRecord("Elementos", payload)
    });

  }


  if(data.unidades && Array.isArray(data.unidades) && data.unidades.length > 0){
    let unidadesToCreate = data.unidades;
    const filtros = {
      where: {
        numero: {
          [Op.in]: unidadesToCreate, // Solo IDs válidos
        },
      },
    };
    const unidadesInBD = await Unidades.findAll(filtros);

    if(unidadesInBD.length > 0 ){
      const numerosEnBD = unidadesInBD.map((el) => el.numero);
      unidadesToCreate = unidadesToCreate.filter(
        (num) => !numerosEnBD.includes(num)
      );
    }

    unidadesToCreate.forEach(async (item) => {
      const payload = {
        numero: item,
        estado_id: data?.estado?.id ?? null,
        municipio_id: data?.municipio?.id ?? null,
        delegacion_id: data?.delegacion?.id ?? null,
      };
      await createRecord("Unidades", payload)
    });

  }
};
export default {
  getFiltrosForTipoUsuario,
  handleElementosAndUnidades,
  getRelaciones,
};
