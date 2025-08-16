import React from 'react';
import { TrendingUp, Users, CheckCircle } from 'lucide-react';
import { useAppContext } from '../context/AppContext';

const ValidationStep = () => {
  const {
    selectedIdea,
    validationData,
    setCurrentStep,
    saveIdea,
    isAuthenticated
  } = useAppContext();
  return (
    <div className="max-w-6xl mx-auto">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold mb-2">Market Validation Results</h2>
        <p className="text-gray-600">Real-time market data for: <strong>{selectedIdea?.title}</strong></p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
            <h3 className="font-semibold text-lg mb-4 flex items-center">
              <TrendingUp className="mr-2 text-green-500" size={20} />
              Search Trends Analysis
            </h3>
            
            {validationData?.keywords && (
              <div className="space-y-6">
                {Object.entries(validationData.keywords).slice(0, 2).map(([keyword, data]) => (
                  <div key={keyword} className="border-b pb-4 last:border-b-0">
                    <div className="flex justify-between items-center mb-3">
                      <h4 className="font-medium capitalize">{keyword}</h4>
                      <div className="flex items-center space-x-4 text-sm">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          data.trend === 'rising' ? 'bg-green-100 text-green-700' : 
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {data.trend}
                        </span>
                        <span className="text-gray-600">
                          {data.currentVolume.toLocaleString()}/month
                        </span>
                      </div>
                    </div>
                    
                    <div className="h-32 bg-gray-50 rounded-lg flex items-end justify-between p-2">
                      {data.monthlyData.slice(-6).map((point, index) => (
                        <div key={index} className="flex flex-col items-center">
                          <div
                            className="bg-blue-500 rounded-t min-w-[8px]"
                            style={{
                              height: `${(point.volume / Math.max(...data.monthlyData.map(p => p.volume))) * 100}px`
                            }}
                          ></div>
                          <span className="text-xs text-gray-500 mt-1">{point.month}</span>
                        </div>
                      ))}
                    </div>
                    
                    <div className="mt-3">
                      <p className="text-sm text-gray-600 mb-2">Related searches:</p>
                      <div className="flex flex-wrap gap-1">
                        {data.relatedQueries.slice(0, 3).map((query, idx) => (
                          <span key={idx} className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs">
                            {query}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
            <h3 className="font-semibold text-lg mb-4 flex items-center">
              <Users className="mr-2 text-blue-500" size={20} />
              Competitive Intelligence
            </h3>
            
            {validationData?.competitorAnalysis && (
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Direct Competitors</span>
                    <span className="font-medium">{validationData.competitorAnalysis.directCompetitors}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Indirect Competitors</span>
                    <span className="font-medium">{validationData.competitorAnalysis.indirectCompetitors}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Average Pricing</span>
                    <span className="font-medium">{validationData.competitorAnalysis.averagePricing}</span>
                  </div>
                </div>
                
                <div>
                  <p className="text-sm text-gray-600 mb-2">Market Gaps Found:</p>
                  <ul className="space-y-1">
                    {validationData.competitorAnalysis.marketGaps.map((gap, index) => (
                      <li key={index} className="text-sm text-green-700 flex items-start">
                        <CheckCircle className="mr-1 mt-0.5" size={12} />
                        {gap}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-xl p-6 border border-green-200">
            <h3 className="font-semibold text-lg mb-2 flex items-center">
              <CheckCircle className="mr-2 text-green-500" size={20} />
              Validation Summary
            </h3>
            
            {validationData?.demandSignals && (
              <div className="space-y-3">
                <div className="bg-white rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Market Opportunity</span>
                    <span className={`text-xs px-2 py-1 rounded ${
                      validationData.demandSignals.demandScore >= 80 ? 'bg-green-100 text-green-700' :
                      validationData.demandSignals.demandScore >= 60 ? 'bg-yellow-100 text-yellow-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {validationData.demandSignals.demandScore >= 80 ? 'Strong' :
                       validationData.demandSignals.demandScore >= 60 ? 'Moderate' : 'Weak'}
                    </span>
                  </div>
                  <p className="text-xs text-gray-600">
                    Score: {validationData.demandSignals.demandScore}/100
                  </p>
                </div>
              </div>
            )}
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl p-6 border border-purple-200">
            <h3 className="font-semibold text-lg mb-2">Ready to Build?</h3>
            <p className="text-sm text-gray-600 mb-4">
              Market data shows this idea has strong potential. Time to turn insights into action.
            </p>
            
            <div className="space-y-2">
              <button className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-2 rounded-lg font-medium hover:shadow-lg transition-all">
                Generate Technical Roadmap
              </button>
              <button className="w-full border border-gray-300 text-gray-700 py-2 rounded-lg font-medium hover:bg-gray-50 transition-all">
                Export Validation Report
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="text-center mt-8 space-x-4">
        <button
          onClick={() => setCurrentStep('ideas')}
          className="text-blue-600 hover:text-blue-700 font-medium"
        >
          ← Back to Ideas
        </button>
        <button
          onClick={() => {
            const newIdea = { ...selectedIdea, validated: true, validationData };
            saveIdea(newIdea);
          }}
          className="bg-green-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-green-700 transition-colors"
        >
          Save Validated Idea
        </button>
        {isAuthenticated && (
          <button
            onClick={() => setCurrentStep('dashboard')}
            className="text-purple-600 hover:text-purple-700 font-medium"
          >
            Go to Dashboard →
          </button>
        )}
      </div>
    </div>
  );
};

export default ValidationStep;