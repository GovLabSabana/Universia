import React, { useEffect, useState } from "react";
import { evaluationAPI } from "../services/api";
import {
  Shield,
  Users,
  Leaf,
  ArrowLeft,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Send,
  MessageSquare,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import toast from "react-hot-toast";

const dimensionConfig = {
  1: {
    name: "Gobernanza",
    color: "text-purple-600",
    bg: "bg-purple-50",
    border: "border-purple-200",
    icon: <Shield className="h-6 w-6" />,
    progressColor: "bg-purple-500",
    accent: "bg-purple-600",
  },
  2: {
    name: "Social",
    color: "text-blue-600",
    bg: "bg-blue-50",
    border: "border-blue-200",
    icon: <Users className="h-6 w-6" />,
    progressColor: "bg-blue-500",
    accent: "bg-blue-600",
  },
  3: {
    name: "Ambiental",
    color: "text-emerald-600",
    bg: "bg-emerald-50",
    border: "border-emerald-200",
    icon: <Leaf className="h-6 w-6" />,
    progressColor: "bg-emerald-500",
    accent: "bg-emerald-600",
  },
};

const EvaluationForm = ({
  universityId,
  dimensionId: initialDimensionId,
  onExit,
  onFinish,
}) => {
  const [dimensionId, setDimensionId] = useState(initialDimensionId);
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [responses, setResponses] = useState([]);
  const [comments, setComments] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        setLoading(true);
        setError(null);
        setSuccess(null);
        setResponses([]);
        setComments("");
        setCurrentIndex(0);

        const res = await evaluationAPI.getQuestions(dimensionId);
        setQuestions(res.data.data || []);
      } catch (err) {
        console.error(err);
        setError("Error cargando preguntas.");
      } finally {
        setLoading(false);
      }
    };
    fetchQuestions();
  }, [dimensionId]);

  const handleAnswer = (score) => {
    const currentQ = questions[currentIndex];

    // Filtrar respuestas existentes para esta pregunta y agregar la nueva
    const filteredResponses = responses.filter(
      (r) => r.question_id !== currentQ.id
    );
    const newResponses = [
      ...filteredResponses,
      { question_id: currentQ.id, score },
    ];
    setResponses(newResponses);

    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handlePreviousQuestion = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleNextQuestion = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handleSubmit = async () => {
    try {
      setSubmitting(true);
      setError(null);
      setSuccess(null);

      await evaluationAPI.postEvaluation({
        university_id: universityId,
        dimension_id: dimensionId,
        responses,
        comments,
      });

      if (dimensionId < 3) {
        const currentDimension =
          dimensionConfig[dimensionId]?.name || `Dimensión ${dimensionId}`;
        const nextDimension =
          dimensionConfig[dimensionId + 1]?.name ||
          `Dimensión ${dimensionId + 1}`;

        toast.success(`${currentDimension} completada`, {
          duration: 2000,
        });

        setTimeout(() => {
          toast(`Continuando con ${nextDimension}...`, {
            duration: 1500,
          });
          setDimensionId(dimensionId + 1);
        }, 1500);
      } else {
        toast.success("Evaluación completa en todas las dimensiones", {
          duration: 3000,
        });

        setTimeout(() => {
          if (onFinish) {
            onFinish();
          } else if (onExit) {
            onExit();
          }
        }, 2000);
      }
    } catch (err) {
      console.error(err);
      const errorMessage =
        err.response?.data?.message || "Error al enviar la evaluación.";

      toast.error(errorMessage, {
        duration: 4000,
      });

      setError(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border-2 border-blue-500 shadow-sm p-8">
        <div className="flex items-center justify-center py-16">
          <div className="text-center">
            <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-slate-600">Cargando preguntas...</p>
          </div>
        </div>
      </div>
    );
  }

  const config = dimensionConfig[dimensionId] || {};
  const currentQ = questions[currentIndex];
  const progress =
    questions.length > 0 ? ((currentIndex + 1) / questions.length) * 100 : 0;
  const isLastQuestion = currentIndex === questions.length - 1;
  const hasAnswered = responses.some((r) => r.question_id === currentQ?.id);
  const allQuestionsAnswered = responses.length === questions.length;

  return (
    <div className="bg-white rounded-2xl border-2 border-blue-500 shadow-sm p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-4">
          <div
            className={`w-12 h-12 ${config.bg} ${config.border} border rounded-xl flex items-center justify-center`}
          >
            <div className={config.color}>{config.icon}</div>
          </div>
          <div>
            <h2 className={`text-2xl font-bold ${config.color}`}>
              Evaluación — {config.name}
            </h2>
            <p className="text-slate-500 mt-1">
              Pregunta {currentIndex + 1} de {questions.length}
            </p>
          </div>
        </div>

        <div className=" items-center space-x-2 hidden md:flex">
          {/* Navigation buttons - only show if not all questions answered */}
          {!allQuestionsAnswered && (
            <>
              <button
                onClick={handlePreviousQuestion}
                disabled={currentIndex === 0}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors duration-200 ${
                  currentIndex === 0
                    ? "text-slate-300 cursor-not-allowed"
                    : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"
                }`}
                title="Pregunta anterior"
              >
                <ChevronLeft className="h-4 w-4" />
                <span className="text-sm font-medium">Anterior</span>
              </button>

              <button
                onClick={handleNextQuestion}
                disabled={currentIndex === questions.length - 1 || !hasAnswered}
                className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors duration-200 ${
                  currentIndex === questions.length - 1 || !hasAnswered
                    ? "text-slate-300 cursor-not-allowed"
                    : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"
                }`}
                title="Siguiente pregunta"
              >
                <span className="text-sm font-medium">Siguiente</span>
                <ChevronRight className="h-4 w-4" />
              </button>
            </>
          )}

          <div className="w-px h-6 bg-slate-300 mx-2"></div>

          <button
            onClick={onExit}
            className="flex items-center space-x-2 text-slate-500 hover:text-slate-700 hover:bg-slate-50 transition-colors duration-200 px-4 py-2 rounded-lg"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="text-sm font-medium">Volver al Dashboard</span>
          </button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-slate-600">Progreso</span>
          <span className="text-sm text-slate-500">
            {allQuestionsAnswered ? "100%" : Math.round(progress) + "%"}
          </span>
        </div>
        <div className="w-full bg-slate-200 rounded-full h-2">
          <div
            className={`${config.progressColor} h-2 rounded-full transition-all duration-500 ease-out`}
            style={{ width: allQuestionsAnswered ? "100%" : `${progress}%` }}
          ></div>
        </div>
      </div>

      {/* Show questions only if not all are answered */}
      {!allQuestionsAnswered && (
        <>
          {/* Central Question */}
          <div className="text-center mb-6">
            <p className="text-lg text-slate-600 font-medium">
              ¿Cuál cree que es el estado que mejor describe el avance de su
              institución en el siguiente aspecto?
            </p>
          </div>

          {/* Question/Criteria */}
          {currentQ ? (
            <div className="mb-8">
              <div className="mb-8 text-center">
                <h3 className="text-2xl font-bold text-blue-600">
                  {currentQ.text}
                </h3>
              </div>

              {/* Answer Options */}
              <div className="space-y-3">
                {Object.entries(currentQ.scale_descriptions).map(
                  ([score, desc]) => {
                    const isSelected = responses.some(
                      (r) =>
                        r.question_id === currentQ.id &&
                        r.score === parseInt(score)
                    );

                    return (
                      <button
                        key={score}
                        onClick={() => handleAnswer(parseInt(score))}
                        className={`w-full text-left p-5 border rounded-xl transition-all duration-200 ${
                          isSelected
                            ? `${config.bg} ${config.border} border-2 ring-2 ring-opacity-20 ${config.color}`
                                .replace("ring-purple", "ring-purple-300")
                                .replace("ring-blue", "ring-blue-300")
                                .replace("ring-emerald", "ring-emerald-300")
                            : "border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                        }`}
                      >
                        <div className="flex items-start space-x-4">
                          <div
                            className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-1 ${
                              isSelected
                                ? `${config.border} ${config.bg}`
                                : "border-slate-300"
                            }`}
                          >
                            {isSelected && (
                              <CheckCircle
                                className={`h-5 w-5 ${config.color}`}
                              />
                            )}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center space-x-2">
                              <span className="font-bold text-slate-900 text-lg">
                                {score}
                              </span>
                              <div className="w-1 h-1 bg-slate-400 rounded-full"></div>
                              <p className="text-slate-700 leading-relaxed">
                                {desc}
                              </p>
                            </div>
                          </div>
                        </div>
                      </button>
                    );
                  }
                )}
              </div>
            </div>
          ) : (
            <div className="bg-slate-50 rounded-xl p-12 text-center mb-8">
              <p className="text-slate-500 text-lg">
                No hay más preguntas disponibles.
              </p>
            </div>
          )}
        </>
      )}

      {/* Comments Section - Only show when all questions are answered */}
      {allQuestionsAnswered && (
        <>
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-2">
              ¡Todas las preguntas completadas!
            </h3>
            <p className="text-slate-600">
              Puedes agregar comentarios adicionales antes de enviar tu
              evaluación de {config.name}.
            </p>
          </div>

          <div className="mb-8 p-6 bg-slate-50 rounded-xl">
            <div className="flex items-center space-x-2 mb-4">
              <MessageSquare className="h-5 w-5 text-slate-500" />
              <label className="text-sm font-semibold text-slate-700">
                Comentarios adicionales (opcional)
              </label>
            </div>
            <textarea
              value={comments}
              onChange={(e) => setComments(e.target.value)}
              placeholder="Comparte cualquier observación o sugerencia sobre esta dimensión..."
              rows={4}
              className="w-full border border-slate-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none bg-white transition-colors duration-200"
            />
          </div>
        </>
      )}

      {/* Submit Button - Only show when all questions are answered */}
      {allQuestionsAnswered && (
        <div className="border-t border-slate-200 pt-6">
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className={`w-full ${config.accent} text-white py-4 px-6 rounded-xl hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-all duration-200 font-semibold`}
          >
            {submitting ? (
              <>
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-3"></div>
                Enviando evaluación...
              </>
            ) : (
              <>
                <Send className="h-5 w-5 mr-3" />
                Enviar evaluación de {config.name}
              </>
            )}
          </button>
        </div>
      )}
      <div className=" items-center space-x-2 flex md:hidden flex-col">
        {/* Navigation buttons - only show if not all questions answered */}
        {!allQuestionsAnswered && (
          <div className="flex flex-row">
            <button
              onClick={handlePreviousQuestion}
              disabled={currentIndex === 0}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors duration-200 ${
                currentIndex === 0
                  ? "text-slate-300 cursor-not-allowed"
                  : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"
              }`}
              title="Pregunta anterior"
            >
              <ChevronLeft className="h-4 w-4" />
              <span className="text-sm font-medium">Anterior</span>
            </button>

            <button
              onClick={handleNextQuestion}
              disabled={currentIndex === questions.length - 1 || !hasAnswered}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors duration-200 ${
                currentIndex === questions.length - 1 || !hasAnswered
                  ? "text-slate-300 cursor-not-allowed"
                  : "text-slate-500 hover:text-slate-700 hover:bg-slate-50"
              }`}
              title="Siguiente pregunta"
            >
              <span className="text-sm font-medium">Siguiente</span>
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        )}

        <div className="w-px h-6 bg-slate-300 mx-2"></div>

        <button
          onClick={onExit}
          className="flex items-center space-x-2 text-slate-500 hover:text-slate-700 hover:bg-slate-50 transition-colors duration-200 px-4 py-2 rounded-lg"
        >
          <ArrowLeft className="h-4 w-4" />
          <span className="text-sm font-medium">Volver al Dashboard</span>
        </button>
      </div>

      {/* Error/Success Messages */}
      {error && (
        <div className="mt-6 bg-red-50 border border-red-200 rounded-xl p-4">
          <div className="flex items-start space-x-3">
            <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
      )}

      {success && (
        <div className="mt-6 bg-emerald-50 border border-emerald-200 rounded-xl p-4">
          <div className="flex items-start space-x-3">
            <CheckCircle className="h-5 w-5 text-emerald-600 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-emerald-700">{success}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default EvaluationForm;
