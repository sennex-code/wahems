import React, { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "./ui/button";
import QuestionFormModal, { QuestionCreateUpdate } from "./ExamQuestionFormModal";
import ConfirmationModal from "./ConfirmationModal";
import axios from "axios";

interface ExamManagementModalProps {
  open: boolean;
  onClose?: () => void;
}

export const ExamManagementModal: React.FC<ExamManagementModalProps> = ({
  open,
  onClose,
}) => {
  // BANK MANAGEMENT
  const [selectedBank, setSelectedBank] = useState<string | null>(null);

  // QUESTIONS DATA
  const [examQuestions, setExamQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // FORM MODAL CONTROL
  const [showQuestionForm, setShowQuestionForm] = useState(false);
  const [editData, setEditData] = useState<QuestionCreateUpdate | null>(null);

  // CONFIRMATION MODAL CONTROL
  const [showConfirm, setShowConfirm] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Fetch questions for given bank
  const fetchExamQuestions = async (bank: string) => {
    setLoading(true);
    setSelectedBank(bank);
    try {
      const response = await axios.get(`/exam-management/${bank}/`);
      setExamQuestions(response.data);
    } catch (error) {
      setExamQuestions([]);
      // You may want to show a toast or error indicator here
    }
    setLoading(false);
  };

  // Add or edit question handler
  const handleSubmitQuestion = async (data: QuestionCreateUpdate) => {
    if (!selectedBank) return;
    if (data.id) {
      // UPDATE
      await axios.put(`/exam-management/${selectedBank}/${data.id}/`, data);
    } else {
      // CREATE
      await axios.post(`/exam-management/${selectedBank}/`, data);
    }
    await fetchExamQuestions(selectedBank);
  };

  // Delete handler
  const handleDeleteQuestion = async (id: string) => {
    if (!selectedBank) return;
    await axios.delete(`/exam-management/${selectedBank}/${id}/`);
    await fetchExamQuestions(selectedBank);
  };

  // When modal closes, reset everything
  useEffect(() => {
    if (!open) {
      setSelectedBank(null);
      setExamQuestions([]);
      setShowQuestionForm(false);
      setEditData(null);
      setShowConfirm(false);
      setDeleteId(null);
    }
  }, [open]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/30"
      onClick={onClose}
    >
      <Card
        className="relative max-h-[80vh] w-full max-w-[800px] overflow-hidden rounded-2xl"
        onClick={e => e.stopPropagation()}
      >
        <CardHeader className="flex flex-row items-center justify-between p-4 pb-2">
          <CardTitle>Exam Management</CardTitle>
          {onClose && (
            <button
              onClick={onClose}
              aria-label="Close"
              className="text-2xl text-muted-foreground hover:text-black absolute top-3 right-3 bg-transparent border-none"
              type="button"
            >
              &times;
            </button>
          )}
        </CardHeader>
        <CardContent className="p-4 pt-0 flex flex-col gap-6 overflow-y-auto max-h-[65vh]">

          {/* Question bank select & add button */}
          <div className="flex gap-4 mb-2 flex-wrap justify-center">
            <Button
              variant={selectedBank === "lgu" ? "default" : "outline"}
              className="min-w-[10rem]"
              onClick={() => fetchExamQuestions("lgu")}
            >
              WAHtermelon Exam
            </Button>
            <Button
              variant={selectedBank === "private" ? "default" : "outline"}
              className="min-w-[10rem]"
              onClick={() => fetchExamQuestions("private")}
            >
              Private Exam
            </Button>
            <Button
              variant={selectedBank === "specialized" ? "default" : "outline"}
              className="min-w-[10rem]"
              onClick={() => fetchExamQuestions("specialized")}
            >
              Specialized
            </Button>
            {selectedBank && (
              <Button
              
                className="min-w-[10rem]"
                onClick={() => {
                  setEditData(null);
                  setShowQuestionForm(true);
                }}
              >
                + Add Question
              </Button>
            )}
          </div>

          {/* LOADING */}
          {loading && <p className="text-center text-gray-500">Loading...</p>}

          {/* QUESTIONS LIST */}
          <div className="flex flex-col gap-4">
            {!loading && examQuestions.length > 0 ? (
              examQuestions.map((question: any) => (
                <Card key={question.id} className="w-full">
                  <CardContent className="py-4 px-6">

                    {/* Top-right edit/delete */}
                    <div className="flex justify-end gap-2 mb-2">
                      <Button
                        variant="outline"
                        onClick={() => {
                          setEditData(question);
                          setShowQuestionForm(true);
                        }}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="destructive"
                        onClick={() => {
                          setDeleteId(question.id);
                          setShowConfirm(true);
                        }}
                      >
                        Delete
                      </Button>
                    </div>

                    <p>
                      <strong>Question:</strong> {question.question_text}
                    </p>
                    <p className="mt-2 mb-1">
                      <strong>Choices:</strong>
                    </p>
                    <ul className="list-disc list-inside space-y-1">
                      {question.choices.map((choice: any) => (
                        <li key={choice.id}>
                          {choice.choice_text}{" "}
                          {choice.is_correct ? (
                            <span className="text-green-600 font-semibold">
                              (Correct)
                            </span>
                          ) : ""}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))
            ) : (
              !loading && selectedBank && (
                <p className="text-center text-gray-500">
                  No exam questions found.
                </p>
              )
            )}
          </div>
        </CardContent>
      </Card>

      {/* Add/Edit Modal */}
      <QuestionFormModal
        open={showQuestionForm}
        onClose={() => {
          setShowQuestionForm(false);
          setEditData(null);
        }}
        onSubmit={async (data) => await handleSubmitQuestion(data)}
        initialData={editData}
      />

      {/* Delete Confirm Modal */}
      <ConfirmationModal
        open={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={async () => {
          if (deleteId) await handleDeleteQuestion(deleteId);
        }}
        message="Are you sure you want to delete this question?"
      />
    </div>
  );
};

export default ExamManagementModal;