import React from "react";
import toast from "react-hot-toast";
import {
  Building2,
  MapPin,
  Play,
  CheckCircle,
  Shield,
  Users,
  Leaf,
  Trash2,
} from "lucide-react";

const AssignedUniversity = ({
  university,
  nextDimension,
  onStartEvaluation,
  onDelete,
  evaluation,
}) => {
  const dimensionConfig = {
    1: {
      name: "Gobernanza",
      icon: <Shield className="h-5 w-5" />,
      color: "text-purple-600",
      bg: "bg-purple-50",
      border: "border-purple-200",
    },
    2: {
      name: "Social",
      icon: <Users className="h-5 w-5" />,
      color: "text-blue-600",
      bg: "bg-blue-50",
      border: "border-blue-200",
    },
    3: {
      name: "Ambiental",
      icon: <Leaf className="h-5 w-5" />,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
      border: "border-emerald-200",
    },
  };

  const getDimensionStatus = (dimensionId) => {
    if (!nextDimension) return "completed"; // Todas completadas
    return dimensionId < nextDimension
      ? "completed"
      : dimensionId === nextDimension
      ? "next"
      : "pending";
  };
  console.log("evaluations", evaluation);

  // Función mejorada para manejar la eliminación con confirmación toast
  const handleDelete = async (group) => {
    const universityName = group.university?.name || "esta universidad";

    toast(
      (t) => (
        <div className="flex flex-col space-y-3">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0 w-10 h-10 bg-red-50 rounded-full flex items-center justify-center">
              <Trash2 className="h-5 w-5 text-red-600" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">
                Confirmar eliminación
              </p>
              <p className="text-sm text-gray-600 mt-1">
                ¿Estás seguro de que deseas eliminar todas las evaluaciones de{" "}
                <span className="font-semibold">{universityName}</span>?
              </p>
            </div>
          </div>
          <div className="flex space-x-3 pt-2">
            <button
              onClick={async () => {
                toast.dismiss(t.id);
                try {
                  toast.loading("Eliminando evaluaciones...");

                  if (onDelete) {
                    await onDelete(group);
                  }

                  toast.dismiss();
                  toast.success("Evaluaciones eliminadas correctamente");

                  // Recargar la página después de eliminar
                  setTimeout(() => {
                    window.location.reload();
                  }, 1000);
                } catch (error) {
                  console.error("Error al eliminar:", error);
                  toast.dismiss();
                  toast.error(
                    "Error al eliminar las evaluaciones. Intenta de nuevo."
                  );
                }
              }}
              className="flex-1 bg-red-600 text-white text-sm font-medium py-2 px-3 rounded-lg hover:bg-red-700 transition-colors"
            >
              Eliminar
            </button>
            <button
              onClick={() => toast.dismiss(t.id)}
              className="flex-1 bg-gray-100 text-gray-700 text-sm font-medium py-2 px-3 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancelar
            </button>
          </div>
        </div>
      ),
      {
        duration: Infinity,
        style: {
          maxWidth: "400px",
          padding: "16px",
        },
      }
    );
  };
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-8">
      {/* Header de Universidad Asignada */}
      <div className="mb-8">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center">
            <Building2 className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-slate-600">
              Universidad Asignada
            </h3>
            <h4 className="text-2xl font-bold text-slate-900">
              {university.name}
            </h4>
          </div>
        </div>
        <div className="flex items-center text-slate-500 ml-13">
          <MapPin className="h-4 w-4 mr-2" />
          <span>
            {university.city}, {university.department}
          </span>
        </div>
      </div>

      {/* Progreso de Evaluaciones */}
      <div className="mb-8">
        <div className="mb-6 flex flex-row justify-between items-center">
          <h5 className="text-lg font-semibold text-slate-900 ">
            Progreso de Evaluación
          </h5>
          <button
            onClick={() => handleDelete(evaluation)}
            className="text-red-500 hover:text-red-700 hover:bg-red-50 transition-colors duration-200 p-3 rounded-lg flex flex-row items-center gap-4"
            title="Eliminar todas las evaluaciones de esta universidad"
          >
            <Trash2 className="h-5 w-5" />
            Eliminar Evaluaciones
          </button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((dimensionId) => {
            const config = dimensionConfig[dimensionId];
            const status = getDimensionStatus(dimensionId);

            return (
              <div
                key={dimensionId}
                className={`relative p-6 rounded-xl border transition-all duration-200 ${
                  status === "completed"
                    ? "bg-emerald-50 border-emerald-200"
                    : status === "next"
                    ? `${config.bg} ${config.border} ring-2 ring-blue-100`
                    : "bg-slate-50 border-slate-200"
                }`}
              >
                {/* Indicador de estado */}
                <div className="absolute top-4 right-4">
                  {status === "completed" && (
                    <div className="w-6 h-6 bg-emerald-100 rounded-full flex items-center justify-center">
                      <CheckCircle className="h-4 w-4 text-emerald-600" />
                    </div>
                  )}
                  {status === "next" && (
                    <div className="w-3 h-3 bg-blue-600 rounded-full animate-pulse"></div>
                  )}
                  {status === "pending" && (
                    <div className="w-3 h-3 bg-slate-300 rounded-full"></div>
                  )}
                </div>

                <div className="flex items-center space-x-3">
                  <div
                    className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      status === "completed"
                        ? "bg-emerald-100"
                        : status === "next"
                        ? config.bg
                        : "bg-slate-100"
                    }`}
                  >
                    <div
                      className={
                        status === "completed"
                          ? "text-emerald-600"
                          : status === "next"
                          ? config.color
                          : "text-slate-400"
                      }
                    >
                      {config.icon}
                    </div>
                  </div>
                  <div>
                    <h6
                      className={`font-semibold ${
                        status === "completed"
                          ? "text-emerald-700"
                          : status === "next"
                          ? config.color
                          : "text-slate-500"
                      }`}
                    >
                      {config.name}
                    </h6>
                    <p className="text-sm text-slate-500">
                      {status === "completed"
                        ? "Completada"
                        : status === "next"
                        ? "Siguiente"
                        : "Pendiente"}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Botón de Acción */}
      <div className="border-t border-slate-200 pt-6">
        {nextDimension ? (
          <button
            onClick={() => onStartEvaluation(university.id, nextDimension)}
            className="w-full bg-blue-600 text-white py-4 px-6 rounded-xl hover:bg-blue-700 flex items-center justify-center transition-colors duration-200 font-semibold"
          >
            <Play className="h-5 w-5 mr-3" />
            Continuar Evaluación - {dimensionConfig[nextDimension].name}
          </button>
        ) : (
          <div className="w-full bg-emerald-50 border border-emerald-200 text-emerald-800 py-4 px-6 rounded-xl flex items-center justify-center">
            <CheckCircle className="h-5 w-5 mr-3" />
            <span className="font-semibold">Evaluación Completada</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default AssignedUniversity;
