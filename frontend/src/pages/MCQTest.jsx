import React, { useState, useEffect } from "react";
import axios from "axios";
import ReactMarkdown from "react-markdown";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/context/AuthContext";
import { useNavigate } from "react-router-dom";

const BASE = "http://localhost:5000";

const MCQTest = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [questions, setQuestions] = useState([]);
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState({});
  const [evaluation, setEvaluation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [stage2Started, setStage2Started] = useState(false);
  const [stage2Questions, setStage2Questions] = useState([]);
  const [stage2Answers, setStage2Answers] = useState({});
  const [stage2Eval, setStage2Eval] = useState(null);
  const [stage2Loading, setStage2Loading] = useState(false);

  useEffect(() => {
    if (user?.skills?.length) fetchQuestions();
  }, [user]);

  const fetchQuestions = async () => {
    setLoading(true);
    try {
      const res = await axios.post(`${BASE}/generate-mcqs`, {
        skills: user.skills,
      });
      setQuestions(res.data.questions || []);
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  };

  const handleAnswer = (option) => {
    setAnswers({ ...answers, [currentQ]: option });
  };

  const handleNext = () => {
    if (currentQ < questions.length - 1) {
      setCurrentQ(currentQ + 1);
    } else {
      handleSubmit();
    }
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const res = await axios.post(`${BASE}/evaluate-mcqs`, {
        questions,
        user_answers: answers,
      });
      setEvaluation(res.data.evaluation);
    } catch (err) {
      console.error(err);
    }
    setSubmitting(false);
  };

  const startStage2 = async () => {
    setStage2Loading(true);
    try {
      const res = await axios.post(`${BASE}/generate-descriptive`, {
        skills: user.skills,
      });
      setStage2Questions(res.data.questions || []);
      setStage2Started(true);
      setStage2Answers({});
      setStage2Eval(null);
    } catch (err) {
      console.error(err);
    }
    setStage2Loading(false);
  };

  const submitStage2 = async () => {
    setStage2Loading(true);
    try {
      const res = await axios.post(`${BASE}/evaluate-descriptive`, {
        questions: stage2Questions,
        user_answers: stage2Answers,
      });
      setStage2Eval(res.data.evaluation);
    } catch (err) {
      console.error(err);
    }
    setStage2Loading(false);
  };

  const resetAll = () => {
    setQuestions([]);
    setEvaluation(null);
    setAnswers({});
    setCurrentQ(0);
    setStage2Started(false);
    setStage2Questions([]);
    setStage2Answers({});
    setStage2Eval(null);
  };

  if (!user?.skills?.length) {
    return (
      <div className="max-w-screen-md mx-auto px-4 py-10">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-bold">
              No Skills Found
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              You don’t have any skills added to your profile. Please add skills
              before starting the test.
            </p>
            <Button onClick={() => navigate(`/user-profile/${user._id}`)}>
              Go to Profile
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!questions.length && !evaluation) {
    return (
      <div className="max-w-screen-md mx-auto px-4 py-10">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-bold">
              Loading Questions...
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              {loading
                ? "Generating questions based on your skills..."
                : "Unable to generate questions."}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (submitting) {
    return (
      <div className="max-w-screen-md mx-auto px-4 py-10">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-bold">Evaluating...</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Evaluating your answers, please wait...
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (evaluation && !stage2Started) {
    return (
      <div className="max-w-screen-xl mx-auto px-4 py-10 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-bold">
              Final Evaluation
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg mb-3">
              Score:{" "}
              <Badge variant="outline" className="text-lg">
                {evaluation?.score ?? 0} / {questions.length}
              </Badge>
            </p>
            <Separator className="my-4" />
            {(evaluation?.details || []).map((d, i) => (
              <div key={i} className="text-sm mb-2">
                <p className="font-medium">
                  Q{i + 1}: {d.is_correct ? "✅ Correct" : "❌ Incorrect"}
                </p>
                <p className="opacity-80">{d.feedback}</p>
              </div>
            ))}
          </CardContent>
          <CardFooter className="flex gap-3">
            <Button variant="secondary" onClick={resetAll}>
              Retake Test
            </Button>
            <Button onClick={startStage2} disabled={stage2Loading}>
              {stage2Loading ? "Preparing…" : "Start Stage 2"}
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  if (!evaluation && questions.length) {
    const q = questions[currentQ];
    return (
      <div className="max-w-screen-xl mx-auto px-4 py-10">
        <Card>
          <CardHeader>
            <CardTitle>
              Question {currentQ + 1} of {questions.length}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-4 prose prose-invert">
              <ReactMarkdown>{q.question}</ReactMarkdown>
            </div>
            <div className="space-y-3">
              {q.options.map((opt, i) => (
                <Button
                  key={i}
                  variant={answers[currentQ] === opt ? "default" : "outline"}
                  className="w-full justify-start text-left whitespace-normal break-words"
                  onClick={() => handleAnswer(opt)}
                >
                  {opt}
                </Button>
              ))}
            </div>
          </CardContent>
          <CardFooter className="flex justify-end">
            <Button onClick={handleNext}>
              {currentQ < questions.length - 1 ? "Next" : "Submit"}
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  if (stage2Started && !stage2Eval) {
    return (
      <div className="max-w-screen-xl mx-auto px-4 py-10">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-bold">
              Stage 2: Coding / Descriptive
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {stage2Questions.map((q, idx) => (
              <div key={idx} className="space-y-2">
                <p className="font-semibold">
                  Q{idx + 1}. {q.question}
                </p>
                <Textarea
                  rows={6}
                  placeholder="Type your answer or paste code here…"
                  value={stage2Answers[idx] || ""}
                  onChange={(e) =>
                    setStage2Answers({
                      ...stage2Answers,
                      [idx]: e.target.value,
                    })
                  }
                />
              </div>
            ))}
          </CardContent>
          <CardFooter className="flex justify-end gap-3">
            <Button variant="secondary" onClick={resetAll}>
              Cancel
            </Button>
            <Button onClick={submitStage2} disabled={stage2Loading}>
              {stage2Loading ? "Evaluating…" : "Submit Stage 2"}
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  if (stage2Eval) {
    const total = stage2Eval.total_score ?? 0;
    return (
      <div className="max-w-screen-xl mx-auto px-4 py-10 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl font-bold">
              Stage 2 Evaluation
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-lg">
              Total Score:{" "}
              <Badge variant="outline" className="text-lg">
                {total} / 30
              </Badge>
            </p>
            <Separator className="my-2" />
            {(stage2Eval.details || []).map((row, i) => (
              <div key={i} className="space-y-1">
                <p className="font-semibold">Q{i + 1}</p>
                <p className="opacity-80">Score: {row.score}/10</p>
                <p className="opacity-80">Feedback: {row.feedback}</p>
              </div>
            ))}
          </CardContent>
          <CardFooter className="flex gap-3">
            <Button variant="secondary" onClick={resetAll}>
              Finish
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return null;
};

export default MCQTest;
