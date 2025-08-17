import React, { useState } from 'react';
import { Users, Clipboard, ExternalLink, AlertTriangle } from 'lucide-react';

const ValidationPlaybook = ({ validationData, onExportReport }) => {
  const [activeStep, setActiveStep] = useState(1);
  
  // Extract the new risk and competitor data
  const keyRisks = validationData?.competitorAnalysis?.keyRisks || [];
  const topCompetitors = validationData?.competitorAnalysis?.topCompetitors || [];
  const userComplaints = validationData?.competitorAnalysis?.aggregatedUserSentiment?.commonComplaints || [];
  const targetAudience = validationData?.targetAudience;

  const steps = [
    {
      id: 1,
      title: "Interview Your Target Audience",
      icon: Users,
      description: "Confirm that the key pain points are real, severe, and that people are willing to pay for a solution.",
      color: "blue"
    },
    {
      id: 2,
      title: "Analyze the Competition",
      icon: ExternalLink,
      description: "Sign up for competitor free trials. Identify their true weaknesses and user experience gaps.",
      color: "green"
    },
    {
      id: 3,
      title: "Address Key Risks",
      icon: AlertTriangle,
      description: "Be aware of the primary challenges before you start building.",
      color: "red"
    }
  ];

  const getStepColor = (color) => {
    const colors = {
      blue: "bg-blue-100 text-blue-600",
      green: "bg-green-100 text-green-600", 
      red: "bg-red-100 text-red-600"
    };
    return colors[color] || colors.blue;
  };

  const generateInterviewQuestions = () => {
    if (!targetAudience) return [];
    
    const questions = [
      `Tell me about your role as a ${targetAudience.persona?.jobTitle}. What does a typical day look like?`,
      `What are the biggest challenges you face in ${targetAudience.painPoints?.[0]?.problem || 'your daily work'}?`,
      `How do you currently handle ${targetAudience.painPoints?.[0]?.problem || 'this challenge'}?`,
      `What would an ideal solution look like to you?`,
      `What would convince you to switch from your current approach to a new tool?`
    ];
    
    return questions;
  };

  return (
    <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm mt-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="font-semibold text-lg">Your Validation Playbook</h3>
          <p className="text-sm text-gray-600 mt-1">
            This idea has potential, but it's just a hypothesis. Here are your next steps to validate it in the real world.
          </p>
        </div>
        <div className="text-sm text-gray-500">
          Step {activeStep} of {steps.length}
        </div>
      </div>

      {/* Step Navigation */}
      <div className="flex space-x-4 mb-8 border-b border-gray-100 pb-4">
        {steps.map((step) => {
          const isActive = activeStep === step.id;
          const colorClass = isActive ? getStepColor(step.color) : "bg-gray-100 text-gray-400";
          
          return (
            <button
              key={step.id}
              onClick={() => setActiveStep(step.id)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                isActive ? 'text-gray-900' : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${colorClass}`}>
                {step.id}
              </div>
              <span className="text-sm font-medium">{step.title}</span>
            </button>
          );
        })}
      </div>

      {/* Step Content */}
      <div className="space-y-6">
        {activeStep === 1 && (
          <div>
            <div className="flex items-start">
              <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center font-bold ${getStepColor('blue')}`}>
                <Users size={20} />
              </div>
              <div className="ml-4 flex-1">
                <h4 className="font-medium text-lg mb-2">Interview Your Target Audience</h4>
                <p className="text-gray-600 mb-4">
                  Your primary goal is to confirm that the "Key Pain Points" are real, severe, and that people are willing to pay for a solution.
                </p>
                
                {targetAudience?.persona && (
                  <div className="bg-gray-50 rounded-lg p-4 mb-4">
                    <h5 className="font-medium mb-2">Target: {targetAudience.persona.name}</h5>
                    <p className="text-sm text-gray-600">
                      {targetAudience.persona.jobTitle} at {targetAudience.persona.companySize} companies
                    </p>
                    {targetAudience.buyingBehavior?.wateringHoles && (
                      <div className="mt-2">
                        <span className="text-sm font-medium">Find them at: </span>
                        <span className="text-sm text-gray-600">
                          {targetAudience.buyingBehavior.wateringHoles.join(', ')}
                        </span>
                      </div>
                    )}
                  </div>
                )}

                <div className="space-y-2">
                  <h5 className="font-medium text-sm">Suggested Interview Questions:</h5>
                  <ul className="space-y-1">
                    {generateInterviewQuestions().map((question, index) => (
                      <li key={index} className="text-sm text-gray-600 pl-4 border-l-2 border-blue-200">
                        {question}
                      </li>
                    ))}
                  </ul>
                </div>

                <button className="mt-4 text-sm text-blue-600 hover:underline flex items-center">
                  <Clipboard size={14} className="mr-1" /> Copy Questions to Clipboard
                </button>
              </div>
            </div>
          </div>
        )}

        {activeStep === 2 && (
          <div>
            <div className="flex items-start">
              <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center font-bold ${getStepColor('green')}`}>
                <ExternalLink size={20} />
              </div>
              <div className="ml-4 flex-1">
                <h4 className="font-medium text-lg mb-2">Analyze the Competition</h4>
                <p className="text-gray-600 mb-4">
                  Sign up for the free trials of these competitors. Is their user experience really as bad as the sentiment suggests? Where are their true weaknesses?
                </p>
                
                {topCompetitors.length > 0 && (
                  <div className="space-y-3 mb-4">
                    <h5 className="font-medium text-sm">Key Competitors to Analyze:</h5>
                    {topCompetitors.map((competitor, index) => (
                      <div key={index} className="bg-gray-50 rounded-lg p-4">
                        <div className="flex justify-between items-start mb-2">
                          <h6 className="font-medium">{competitor.name}</h6>
                          <a 
                            href={competitor.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline text-sm flex items-center"
                          >
                            Visit <ExternalLink size={12} className="ml-1" />
                          </a>
                        </div>
                        <div className="text-sm space-y-1">
                          <p><span className="font-medium text-green-600">Their Strength:</span> {competitor.swot.strength}</p>
                          <p><span className="font-medium text-red-600">Their Weakness:</span> {competitor.swot.weakness}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {userComplaints.length > 0 && (
                  <div className="bg-yellow-50 rounded-lg p-4">
                    <h5 className="font-medium text-sm mb-2">Common User Complaints to Exploit:</h5>
                    <ul className="space-y-1">
                      {userComplaints.map((complaint, index) => (
                        <li key={index} className="text-sm text-gray-600">• {complaint}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeStep === 3 && (
          <div>
            <div className="flex items-start">
              <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center font-bold ${getStepColor('red')}`}>
                <AlertTriangle size={20} />
              </div>
              <div className="ml-4 flex-1">
                <h4 className="font-medium text-lg mb-2">Address Key Risks</h4>
                <p className="text-gray-600 mb-4">
                  Be aware of the primary challenges before you start building.
                </p>
                
                {keyRisks.length > 0 ? (
                  <div className="space-y-3">
                    {keyRisks.map((risk, index) => (
                      <div key={index} className="bg-red-50 rounded-lg p-4">
                        <h5 className="font-medium text-red-700 mb-2">{risk.risk}</h5>
                        <p className="text-sm text-gray-700">
                          <span className="font-medium">Mitigation:</span> {risk.mitigation}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-sm text-gray-600">
                      Risk analysis data not available. Consider conducting your own risk assessment focusing on market saturation, customer acquisition costs, and technical barriers.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Next Steps CTA */}
      <div className="mt-8 pt-6 border-t border-gray-100">
        <div className="bg-blue-50 rounded-lg p-4">
          <h5 className="font-medium text-blue-900 mb-2">Ready to Start Validation?</h5>
          <p className="text-sm text-blue-700 mb-3">
            Download your complete validation report with all the insights, competitor analysis, and interview questions.
          </p>
          <button 
            onClick={onExportReport}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
          >
            Download Full Report
          </button>
        </div>
      </div>
    </div>
  );
};

export default ValidationPlaybook;