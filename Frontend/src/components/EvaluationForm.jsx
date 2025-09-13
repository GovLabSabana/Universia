import React, { useEffect, useState } from "react";
import { evaluationAPI } from "../services/api";

const dimensionConfig = {
  1: {
    name: "Gobernanza",
    color: "text-purple-700",
    bg: "bg-purple-50",
    border: "border-purple-200",
  },
  2: {
    name: "Social",
    color: "text-blue-700",
    bg: "bg-blue-50",
    border: "border-blue-200",
  },
  3: {
    name: "Ambiental",
    color: "text-green-700",
    bg: "bg-green-50",
    border: "border-green-200",
  },
};

const EvaluationForm = ({ universityId, dimensionId: initialDimensionId, onExit }) => {
  const [dimensionId, setDimensionId] = useState(initialDimensionId);
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [responses, setResponses] = useState([]);
  const [comments, setComments] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Cargar preguntas de la dimensión actual
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
    const newResponses = [...responses, { question_id: currentQ.id, score }];
    setResponses(newResponses);

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

      // Si no es la última dimensión, pasar a la siguiente
      if (dimensionId < 3) {
        setSuccess(`¡Dimensión ${dimensionId} enviada con éxito! Continuando con la siguiente...`);
        setTimeout(() => {
          setDimensionId(dimensionId + 1);
        }, 1500);
      } else {
        // Finaliza después de la dimensión 3
        setSuccess("¡Evaluación completa en todas las dimensiones!");
        setTimeout(() => {
          onExit(); // volver al dashboard
        }, 2000);
      }
    } catch (err) {
      console.error(err);
      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError("Error al enviar la evaluación.");
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <p className="text-center">Cargando preguntas...</p>;

  const config = dimensionConfig[dimensionId] || {};
  const currentQ = questions[currentIndex];
  const progress = questions.length > 0 ? ((currentIndex + 1) / questions.length) * 100 : 0;

  return (
    <div className="my-8 p-6 bg-white rounded-2xl shadow-md">
      <h2 className={`text-xl font-bold mb-4 ${config.color}`}>
        Evaluación — {config.name}
      </h2>

      {/* Barra de progreso */}
      <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
        <div
          className="bg-green-500 h-2 rounded-full"
          style={{ width: `${progress}%` }}
        ></div>
      </div>
      <p className="text-sm text-gray-600 mb-4">
        Pregunta {currentIndex + 1} de {questions.length}
      </p>

      {/* Pregunta actual */}
      {currentQ ? (
        <div className="mb-4">
          <p className="font-medium mb-2">{currentQ.text}</p>
          <div className="space-y-2">
            {Object.entries(currentQ.scale_descriptions).map(([score, desc]) => (
              <button
                key={score}
                onClick={() => handleAnswer(parseInt(score))}
                className="w-full text-left px-4 py-2 border rounded-lg hover:bg-gray-100"
              >
                <span className="font-semibold">{score}:</span> {desc}
              </button>
            ))}
          </div>
        </div>
      ) : (
        <p className="text-gray-600">No hay más preguntas.</p>
      )}

      {/* Comentarios (solo al final) */}
      {currentIndex === questions.length - 1 && (
        <textarea
          value={comments}
          onChange={(e) => setComments(e.target.value)}
          placeholder="Comentarios adicionales..."
          className="w-full border rounded-lg p-2 mt-4"
        />
      )}

      {/* Botón enviar (solo al final) */}
      {currentIndex === questions.length - 1 && (
        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="mt-4 px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
        >
          {submitting ? "Enviando..." : "Enviar evaluación"}
        </button>
      )}

      {/* Mensajes */}
      {error && <p className="text-red-500 mt-4">{error}</p>}
      {success && <p className="text-green-600 mt-4">{success}</p>}

      {/* Botón para salir manualmente */}
      <button
        onClick={onExit}
        className="mt-6 px-4 py-2 text-gray-600 border rounded-lg hover:bg-gray-100"
      >
        Cancelar
      </button>
    </div>
  );
};

export default EvaluationForm;
