import Sequelize from "sequelize";
import db from "../models/index.js";

import CRUDController from "./CRUDController.js";
import functionHelper from "./db/functionHelper.js";
import functionsCustomHelper from "./helpers/functionsCustomHelper.js";

const {
  Reportes,
  catEstados,
  catMunicipios,
  catDelegaciones,
  catSitiosIncidente,
  catAreas,
  catHorarios,
  catAgresores,
  Usuarios,
} = db;

const { Op } = Sequelize;
const { getFiltrosForTipoUsuario } = functionsCustomHelper;
const { handleIsAdmin, getAllFromModel } = functionHelper;
const { updateRecord, processSoftDelete } = CRUDController;

const normalizarFecha = (valor) => {
  if (!valor) return null;

  if (/^\d{4}-\d{2}-\d{2}$/.test(valor)) {
    return valor;
  }

  const match = valor.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (!match) {
    throw new Error(`Formato de fecha inválido: ${valor}`);
  }

  const [, dia, mes, anio] = match;
  return `${anio}-${mes}-${dia}`;
};
/**
 * ==============================
 * CONTROLLER
 * ==============================
 */

const getEstadisticas = async (req, res) => {
  try {
    const filtros = {};

    const {
      estado,
      municipio,
      delegacion,
      fechaInicio,
      fechaFin,
      tipoReporte,
      horario,
      area,
      agresor,
      sitioAgresion,
    } = req.body || {};

    const fechaInicioNormalizada = normalizarFecha(fechaInicio);
    const fechaFinNormalizada = normalizarFecha(fechaFin);

    if (fechaInicioNormalizada) {
      filtros.fecha = fechaFinNormalizada
        ? { [Op.between]: [fechaInicioNormalizada, fechaFinNormalizada] }
        : { [Op.gte]: fechaInicioNormalizada };
    } else if (fechaFinNormalizada) {
      filtros.fecha = { [Op.lte]: fechaFinNormalizada };
    }

    if (estado) filtros.estado_id = estado.id;
    if (municipio) filtros.municipio_id = municipio.id;
    if (delegacion) filtros.delegacion_id = delegacion.id;
    if (tipoReporte) filtros.tipo = tipoReporte.value;
    if (horario) filtros.horario_id = horario.id;
    if (area) filtros.area_id = area.id;
    if (agresor) filtros.agresor_id = agresor.id;
    if (sitioAgresion) filtros.sitio_agresion = sitioAgresion.id;

    const estadisticas = await Reportes.findAll({
      where: filtros,
      raw: true,
    });

    let indicadores = {
      total: estadisticas.length,
      porEstado: {},
      porMunicipio: {},
      porDelegacion: {},
      tipoReporte: {},
      porArea: {},
      porHorario: {},
      porSitioAgresion: {},
      porAgresor: {},
    };

    const estadosBD = await catEstados.findAll({ raw: true });
    const municipiosBD = await catMunicipios.findAll({ raw: true });
    const delegacionesBD = await catDelegaciones.findAll({ raw: true });
    const areasBD = await catAreas.findAll({ raw: true });
    const horariosBD = await catHorarios.findAll({ raw: true });
    const agresoresBD = await catAgresores.findAll({ raw: true });
    const sitiosBD = await catSitiosIncidente.findAll({ raw: true });

    const agruparIndicadores = (data, key, bdArray, indicadorKey) => {
      data.forEach((registro) => {
        const id = registro[key];
        if (id === null) {
          indicadores[indicadorKey].Desconocido =
            (indicadores[indicadorKey].Desconocido || 0) + 1;
          return;
        }
        const item = bdArray.find((e) => e.id === id);
        if (!item) return;
        indicadores[indicadorKey][item.label] =
          (indicadores[indicadorKey][item.label] || 0) + 1;
      });
    };

    agruparIndicadores(estadisticas, "estado_id", estadosBD, "porEstado");
    agruparIndicadores(
      estadisticas,
      "municipio_id",
      municipiosBD,
      "porMunicipio",
    );
    agruparIndicadores(
      estadisticas,
      "delegacion_id",
      delegacionesBD,
      "porDelegacion",
    );
    agruparIndicadores(estadisticas, "area_id", areasBD, "porArea");
    agruparIndicadores(estadisticas, "horario_id", horariosBD, "porHorario");
    agruparIndicadores(
      estadisticas,
      "sitio_agresion",
      sitiosBD,
      "porSitioAgresion",
    );
    agruparIndicadores(estadisticas, "agresor_id", agresoresBD, "porAgresor");

    estadisticas.forEach((registro) => {
      const tipoReporte = registro.tipo ?? "Desconocido";
      indicadores.tipoReporte[tipoReporte] =
        (indicadores.tipoReporte[tipoReporte] || 0) + 1;
    });

    return res.json({
      result: true,
      message: "Estadísticas obtenidas con éxito",
      data: indicadores,
    });
  } catch (error) {
    console.log("Error en getEstadisticas:", error);
    return res.json({
      result: false,
      message: "Error al obtener estadísticas",
      data: [],
    });
  }
};

const getEstadisticas2 = async (req, res) => {
  try {
    const filtros = {};

    const {
      estado,
      municipio,
      delegacion,
      fechaInicio,
      fechaFin,
      tipoReporte,
      horario,
      area,
      agresor,
      sitioAgresion,
    } = req.body || {};

    const fechaInicioNormalizada = normalizarFecha(fechaInicio);
    const fechaFinNormalizada = normalizarFecha(fechaFin);

    if (fechaInicioNormalizada) {
      filtros.fecha = fechaFinNormalizada
        ? { [Op.between]: [fechaInicioNormalizada, fechaFinNormalizada] }
        : { [Op.gte]: fechaInicioNormalizada };
    } else if (fechaFinNormalizada) {
      filtros.fecha = { [Op.lte]: fechaFinNormalizada };
    }

    if (estado) filtros.estado_id = estado.id;
    if (municipio) filtros.municipio_id = municipio.id;
    if (delegacion) filtros.delegacion_id = delegacion.id;
    if (tipoReporte) filtros.tipo = tipoReporte.value;
    if (horario) filtros.horario_id = horario.id;
    if (area) filtros.area_id = area.id;
    if (agresor) filtros.agresor_id = agresor.id;
    if (sitioAgresion) filtros.sitio_agresion = sitioAgresion.id;

    const reportes = await Reportes.findAll({
      where: filtros,
      raw: true,
    });

    // Inicializar indicadores
    const indicadores = {
      SAR: {
        totalServicios: 0,
        serviciosPorFecha: {},
        serviciosPorDelegacion: {},
        serviciosPorTipoServicio: {},
        duracionPromedio: 0,
        totalElementos: 0,
        totalUnidades: 0,
        totalFRAPs: 0,
        promedioElementos: 0,
        totalPacientes: 0,
        pacientesPorSexo: { masculino: 0, femenino: 0 },
        edadPromedioPacientes: 0,
        totalTraslados: 0,
        totalNoTraslados: 0,
        tasaTraslado: 0,
        motivosNoTraslado: {},
        serviciosConAutoridades: 0,
      },
      RIS: {
        totalIncidentes: 0,
        incidentesPorFecha: {},
        incidentesPorDelegacion: {},
        incidentesPorTipo: {},
        incidentesPorSitio: {},
        incidentesPrimerRespondiente: 0,
        totalElementos: 0,
        promedioElementos: 0,
        totalAtenciones: 0,
        incidentesConDaniosBienes: 0,
        incidentesConDaniosTerceros: 0,
        incidentesConAmenaza: 0,
        incidentesConMedidas: 0,
      },
      combinados: {
        serviciosVsIncidentesPorZona: {},
        ratioRiesgoOperativo: 0,
        incidentesPorCada100Servicios: 0,
        recursosTotalesDesplegados: 0,
        zonasMayorCargaOperativa: {},
      },
    };

    // Procesar reportes
    reportes.forEach((reporte) => {
      let { tipo, data } = reporte;

      data = JSON.parse(data);

      if (tipo === "SAR") {
        indicadores.SAR.totalServicios++;

        // Servicios por fecha
        indicadores.SAR.serviciosPorFecha[reporte.fecha] =
          (indicadores.SAR.serviciosPorFecha[reporte.fecha] || 0) + 1;

        // Servicios por delegación
        const delegacionLabel = reporte.delegacion?.label || "Desconocido";
        indicadores.SAR.serviciosPorDelegacion[delegacionLabel] =
          (indicadores.SAR.serviciosPorDelegacion[delegacionLabel] || 0) + 1;

        // Servicios por tipo de servicio
        data.tipoServicio?.forEach((servicio) => {
          indicadores.SAR.serviciosPorTipoServicio[servicio.label] =
            (indicadores.SAR.serviciosPorTipoServicio[servicio.label] || 0) + 1;
        });

        // Duración promedio del servicio
        if (reporte.timeInicio && reporte.timeFin) {
          const duracion =
            new Date(`1970-01-01T${reporte.timeFin}Z`) -
            new Date(`1970-01-01T${reporte.timeInicio}Z`);
          indicadores.SAR.duracionPromedio += duracion;
        }

        // Total y promedio de elementos
        const elementos = data.elementos?.length || 0;
        indicadores.SAR.totalElementos += elementos;

        // Total de unidades
        const unidades = data.unidades?.length || 0;
        indicadores.SAR.totalUnidades += unidades;

        // Total de FRAPs
        const fraps = data.fraps?.length || 0;
        indicadores.SAR.totalFRAPs += fraps;

        // Total de pacientes
        const atenciones = data.atenciones || [];
        indicadores.SAR.totalPacientes += atenciones.length;

        // Pacientes por sexo y edad promedio
        atenciones.forEach((atencion) => {
          if (atencion.sexo === "masculino") {
            indicadores.SAR.pacientesPorSexo.masculino++;
          } else if (atencion.sexo === "femenino") {
            indicadores.SAR.pacientesPorSexo.femenino++;
          }
          indicadores.SAR.edadPromedioPacientes += parseInt(atencion.edad, 10);
        });

        // Total de traslados y no traslados
        atenciones.forEach((atencion) => {
          if (atencion.traslado) {
            indicadores.SAR.totalTraslados++;
          } else {
            indicadores.SAR.totalNoTraslados++;
            const motivo = atencion.motivoNoTraslado || "Desconocido";
            indicadores.SAR.motivosNoTraslado[motivo] =
              (indicadores.SAR.motivosNoTraslado[motivo] || 0) + 1;
          }
        });

        // Servicios con autoridades involucradas
        if (data.autoridadesPublicas?.length > 0) {
          indicadores.SAR.serviciosConAutoridades++;
        }
      } else if (tipo === "RIS") {
        indicadores.RIS.totalIncidentes++;

        // Incidentes por fecha
        indicadores.RIS.incidentesPorFecha[reporte.fecha] =
          (indicadores.RIS.incidentesPorFecha[reporte.fecha] || 0) + 1;

        // Incidentes por delegación
        const delegacionLabel = reporte.delegacion?.label || "Desconocido";
        indicadores.RIS.incidentesPorDelegacion[delegacionLabel] =
          (indicadores.RIS.incidentesPorDelegacion[delegacionLabel] || 0) + 1;

        // Incidentes por tipo
        const tipoIncidente = data.tipoIncidente?.label || "Desconocido";
        indicadores.RIS.incidentesPorTipo[tipoIncidente] =
          (indicadores.RIS.incidentesPorTipo[tipoIncidente] || 0) + 1;

        // Incidentes por sitio
        const sitioIncidente = data.sitioIncidente?.label || "Desconocido";
        indicadores.RIS.incidentesPorSitio[sitioIncidente] =
          (indicadores.RIS.incidentesPorSitio[sitioIncidente] || 0) + 1;

        // Incidentes donde CR fue primer respondiente
        if (data.esPrimero) {
          indicadores.RIS.incidentesPrimerRespondiente++;
        }

        // Total y promedio de elementos
        const elementos = data.elementos?.length || 0;
        indicadores.RIS.totalElementos += elementos;

        // Total de atenciones
        const atenciones = data.atenciones || [];
        indicadores.RIS.totalAtenciones += atenciones.length;

        // Incidentes con daños a bienes
        if (data.detallesBienes) {
          indicadores.RIS.incidentesConDaniosBienes++;
        }

        // Incidentes con daños a terceros
        if (data.detallesDaniosTerceros) {
          indicadores.RIS.incidentesConDaniosTerceros++;
        }

        // Incidentes con amenaza o riesgo
        if (data.amenazaRiesgoSeguridad) {
          indicadores.RIS.incidentesConAmenaza++;
        }

        // Incidentes con medidas adoptadas
        if (data.medidasAdoptadas) {
          indicadores.RIS.incidentesConMedidas++;
        }
      }
    });

    // Calcular promedios y combinados
    indicadores.SAR.duracionPromedio /= indicadores.SAR.totalServicios || 1;
    indicadores.SAR.promedioElementos =
      indicadores.SAR.totalElementos / indicadores.SAR.totalServicios || 0;
    indicadores.SAR.edadPromedioPacientes /=
      indicadores.SAR.totalPacientes || 1;
    indicadores.SAR.tasaTraslado =
      indicadores.SAR.totalTraslados / indicadores.SAR.totalPacientes || 0;

    indicadores.RIS.promedioElementos =
      indicadores.RIS.totalElementos / indicadores.RIS.totalIncidentes || 0;

    indicadores.combinados.ratioRiesgoOperativo =
      indicadores.RIS.totalIncidentes / indicadores.SAR.totalServicios || 0;
    indicadores.combinados.incidentesPorCada100Servicios =
      (indicadores.RIS.totalIncidentes / indicadores.SAR.totalServicios) *
        100 || 0;
    indicadores.combinados.recursosTotalesDesplegados =
      indicadores.SAR.totalElementos + indicadores.RIS.totalElementos;

    return res.json({
      result: true,
      message: "Estadísticas obtenidas con éxito",
      data: indicadores,
    });
  } catch (error) {
    console.log("Error en getEstadisticas:", error);
    return res.json({
      result: false,
      message: "Error al obtener estadísticas",
      data: [],
    });
  }
};

const getAll = async (req, res) => {
  try {
    const isAdmin = handleIsAdmin(req);
    const paranoid = !isAdmin;

    let filtros = req.body.filtros || {};
    const page = parseInt(req.body.page) || 1;
    const pageSize = parseInt(req.body.pageSize) || 10;
    const filtrosPorTipoUsuario = await getFiltrosForTipoUsuario(req);
    filtros = { ...filtros, ...filtrosPorTipoUsuario };

    const include = [
      { model: catEstados, as: "estado", attributes: ["id", "label"] },
      { model: catMunicipios, as: "municipio", attributes: ["id", "label"] },
      { model: catDelegaciones, as: "delegacion", attributes: ["id", "label"] },
      { model: Usuarios, as: "userCreate", attributes: ["id", "nombre"] },
    ];

    const response = await getAllFromModel({
      model: Reportes,
      filtros,
      attributes: null,
      include,
      page,
      pageSize,
      paranoid,
    });
    return res.json(response);
  } catch (error) {
    console.error("Error en getAll:", error);
    return res.json({
      result: false,
      message: "Error al obtener registros",
      data: [],
    });
  }
};

const deleteRecord = async (req, res) => {
  const { id } = req.body;

  if (!id) {
    return res.json({
      result: false,
      message: "ID requerido",
    });
  }

  const response = await updateRecord("Reportes", { id, estatus: 0 });
  res.json(response);
};

const softDelete = async (req, res) => {
  const { id } = req.body;
  const response = await processSoftDelete(Reportes, id);
  res.json(response);
};

/**
 * ==============================
 * EXPORT DEFAULT (CLAVE)
 * ==============================
 */

export default {
  getEstadisticas,
  getEstadisticas2,
  getAll,
  deleteRecord,
  softDelete,
};
