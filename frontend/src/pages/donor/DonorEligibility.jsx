import React, { useState } from 'react';
import { AlertCircle, CheckCircle } from 'lucide-react';
import Swal from 'sweetalert2';
import './DonorEligibility.css';

const DonorEligibility = () => {
    const [answers, setAnswers] = useState(Array(10).fill(''));

    const questions = [
        "Are you currently feeling well and healthy?",
        "Are you currently taking any antibiotics or medications for an infection?",
        "Have you had any dental work in the last 72 hours?",
        "Have you traveled outside the country in the last 3 months?",
        "Have you gotten a tattoo or piercing in the last 6 months?",
        "Have you been pregnant or given birth in the last 6 months?",
        "Have you received any vaccinations in the last 4 weeks?",
        "Do you have a history of heart disease, bleeding disorders, or cancer?",
        "Have you ever tested positive for Hepatitis B, Hepatitis C, or HIV?",
        "Have you donated blood, platelets, or plasma in the last 56 days?"
    ];

    const handleAnswer = (index, answer) => {
        const newAnswers = [...answers];
        newAnswers[index] = answer;
        setAnswers(newAnswers);
    };

    const handleSubmit = () => {
        const allAnswered = answers.every(a => a !== '');

        if (!allAnswered) {
            Swal.fire({
                icon: 'warning',
                title: 'Incomplete',
                text: 'Please answer all 10 questions before submitting.',
                confirmButtonColor: 'var(--color-primary)'
            });
            return;
        }

        // Rule: First question must be Yes, all other 9 must be No.
        let isEligible = true;
        let reasons = [];

        if (answers[0] !== 'Yes') {
            isEligible = false;
            reasons.push("You must be feeling well and healthy to donate.");
        }

        const noRequiredQuestions = [
            "You cannot donate while taking antibiotics for an infection.",
            "Recent dental work requires a waiting period before donating.",
            "Recent travel may expose you to regional infections.",
            "Recent tattoos or piercings require a 6-month deferral.",
            "Pregnancy or giving birth requires a 6-month deferral.",
            "Certain vaccinations require a waiting period.",
            "History of severe diseases or cancer makes you ineligible to protect both you and the recipient.",
            "Testing positive for Hepatitis or HIV is a permanent deferral to protect blood supply.",
            "You must wait at least 56 days between whole blood donations."
        ];

        for (let i = 1; i < 10; i++) {
            if (answers[i] !== 'No') {
                isEligible = false;
                reasons.push(noRequiredQuestions[i - 1]);
            }
        }

        if (isEligible) {
            Swal.fire({
                icon: 'success',
                title: 'Eligible to Donate!',
                text: 'Congratulations! Based on your answers, you are eligible to donate blood.',
                confirmButtonColor: '#2E7D32'
            });
        } else {
            // Build the reason list
            const reasonListHtml = `<br/><ul style="text-align: left; padding-left: 20px; font-size: 0.9em; margin-top: 10px;">
                ${reasons.map(r => `<li style="margin-bottom: 5px;">${r}</li>`).join('')}
            </ul>`;

            Swal.fire({
                icon: 'error',
                title: 'Not Eligible',
                html: `Unfortunately, you are not eligible to donate at this time for the following reason(s): ${reasonListHtml}`,
                confirmButtonColor: '#d32f2f'
            });
        }
    };

    return (
        <div className="dashboard eligibility-dashboard">
            <div className="dashboard-header">
                <div>
                    <h1 className="welcome-text">Donor Eligibility Verification</h1>
                    <p className="text-muted">Please answer the following 10 questions truthfully to verify your eligibility to donate.</p>
                </div>
            </div>

            <div className="dashboard-grid">
                <div className="col-span-12">
                    <div className="card">
                        <div className="card-header eligibility-header">
                            <div className="header-title-container">
                                <AlertCircle size={24} color="var(--color-primary)" />
                                <h2>Eligibility Questionnaire</h2>
                            </div>
                            <span className="questions-count">{answers.filter(a => a !== '').length} / 10 Answered</span>
                        </div>
                        <div className="card-body">
                            <div className="questions-list">
                                {questions.map((question, index) => (
                                    <div key={index} className="question-item">
                                        <div className="question-text">
                                            <strong>{index + 1}.</strong> {question}
                                        </div>
                                        <div className="question-actions">
                                            <button
                                                className={`btn-radio ${answers[index] === 'Yes' ? 'selected yes' : ''}`}
                                                onClick={() => handleAnswer(index, 'Yes')}
                                            >
                                                Yes
                                            </button>
                                            <button
                                                className={`btn-radio ${answers[index] === 'No' ? 'selected no' : ''}`}
                                                onClick={() => handleAnswer(index, 'No')}
                                            >
                                                No
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="submit-section">
                                <button className="btn btn-primary btn-submit" onClick={handleSubmit}>
                                    <CheckCircle size={20} />
                                    Submit Answers
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DonorEligibility;
