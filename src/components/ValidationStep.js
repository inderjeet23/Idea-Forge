import React, { useState } from 'react';
import { TrendingUp, Users, CheckCircle, User, DollarSign, Code, Download, Loader } from 'lucide-react';
import { useAppContext } from '../context/AppContext';
import ValidationPlaybook from './ValidationPlaybook';

const ValidationStep = () => {
  const {
    selectedIdea,
    validationData,
    setCurrentStep,
    saveIdea,
    isAuthenticated,
    generateTechnicalRoadmap
  } = useAppContext();

  const [isGeneratingRoadmap, setIsGeneratingRoadmap] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const handleGenerateRoadmap = async () => {
    setIsGeneratingRoadmap(true);
    try {
      await generateTechnicalRoadmap(selectedIdea);
    } catch (error) {
      console.error('Error generating roadmap:', error);
    } finally {
      setIsGeneratingRoadmap(false);
    }
  };

  const handleExportReport = async () => {
    setIsExporting(true);
    try {
      // Create validation report content
      const reportContent = generateValidationReport();
      
      // Create blob and download
      const blob = new Blob([reportContent], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${selectedIdea?.title?.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_validation_report.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting report:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const generateValidationReport = () => {
    const idea = selectedIdea;
    const data = validationData;
    
    // Helper functions for formatting
    const formatCompetitors = () => {
      if (!data?.competitorAnalysis?.topCompetitors) return 'N/A';
      return data.competitorAnalysis.topCompetitors.map(c =>
        `- ${c.name} (${c.url})\n  Strength: ${c.swot.strength}\n  Weakness: ${c.swot.weakness}`
      ).join('\n');
    };

    const formatRisks = () => {
      if (!data?.competitorAnalysis?.keyRisks) return 'N/A';
      return data.competitorAnalysis.keyRisks.map(r => `- ${r.risk}: ${r.mitigation}`).join('\n');
    };

    const formatInterviewQuestions = () => {
      if (!data?.targetAudience?.persona) return 'N/A';
      const questions = [
        `Tell me about your role as a ${data.targetAudience.persona.jobTitle}. What does a typical day look like?`,
        `What are the biggest challenges you face in ${data.targetAudience.painPoints?.[0]?.problem || 'your daily work'}?`,
        `How do you currently handle ${data.targetAudience.painPoints?.[0]?.problem || 'this challenge'}?`,
        `What would an ideal solution look like to you?`,
        `What would convince you to switch from your current approach to a new tool?`
      ];
      return questions.map((q, i) => `${i + 1}. ${q}`).join('\n');
    };
    
    return `
IDEA VALIDATION REPORT & ACTION PLAN
====================================

Business Idea: ${idea?.title}
Generated on: ${new Date().toLocaleDateString()}

OVERVIEW
--------
${idea?.description}

Market Size: ${idea?.market}
Complexity: ${idea?.complexity}
Time to Revenue: ${idea?.timeToRevenue}
Match Score: ${idea?.matchScore}%

TARGET AUDIENCE
---------------
Primary Persona: ${data?.targetAudience?.persona?.name} (${data?.targetAudience?.persona?.jobTitle})
Age Range: ${data?.targetAudience?.persona?.ageRange}
Company Size: ${data?.targetAudience?.persona?.companySize}
Tech Skill Level: ${data?.targetAudience?.persona?.techSkillLevel}

Day in the Life: ${data?.targetAudience?.dayInTheLife || 'N/A'}

Key Pain Points:
${data?.targetAudience?.painPoints?.map(pain => `- ${pain.problem} (Impact: ${pain.impact})`).join('\n') || 'N/A'}

Where to Find Them: ${data?.targetAudience?.buyingBehavior?.wateringHoles?.join(', ') || 'N/A'}
Budget Range: ${data?.targetAudience?.buyingBehavior?.budgetRange}
Decision Makers: ${data?.targetAudience?.buyingBehavior?.decisionMakers?.join(', ')}

MONETIZATION STRATEGY
--------------------
Business Model: ${data?.monetizationStrategy?.primaryModel?.type}
Justification: ${data?.monetizationStrategy?.primaryModel?.justification}

Pricing Tiers:
${data?.monetizationStrategy?.pricingTiers?.map(tier => 
  `- ${tier.name}: ${tier.monthlyPrice}/month (${tier.targetSegment})`
).join('\n') || 'N/A'}

Revenue Projections:
- Year 1 MRR Target: ${data?.monetizationStrategy?.projections?.year1MRR}
- Industry Average CAC: ${data?.monetizationStrategy?.projections?.industryAverageCAC}
- Customer LTV: ${data?.monetizationStrategy?.projections?.customerLTV}
- Time to Profitability: ${data?.monetizationStrategy?.projections?.timeToProfitability}

COMPETITIVE LANDSCAPE
---------------------
${formatCompetitors()}

User Sentiment Analysis:
- Common Complaints: ${data?.competitorAnalysis?.aggregatedUserSentiment?.commonComplaints?.join(', ') || 'N/A'}
- Praised Features: ${data?.competitorAnalysis?.aggregatedUserSentiment?.positiveKeywords?.join(', ') || 'N/A'}

RISK ANALYSIS & MITIGATION
--------------------------
${formatRisks()}

VALIDATION PLAYBOOK (NEXT STEPS)
---------------------------------
1. **Validate the Problem:** Interview 10-15 potential customers from your target audience.
   Use the questions below as a starting point for your conversations:
   ${formatInterviewQuestions()}

2. **Analyze Competitors:** Sign up for the top competitors listed above. 
   Identify specific usability flaws and missing features that align with the "Common Complaints" from user sentiment.

3. **Justify Your Price:** Based on your competitor analysis and customer interviews, 
   confirm that your proposed pricing is justifiable given the value you provide.

TECHNICAL ROADMAP
-----------------
${data?.roadmap ? `
MVP Phase (${data.roadmap.mvp?.timeline}):
${data.roadmap.mvp?.coreFeatures?.map(feature => `- ${feature}`).join('\n')}

Tech Stack: ${data.roadmap.mvp?.techStack?.frontend}, ${data.roadmap.mvp?.techStack?.backend}, ${data.roadmap.mvp?.techStack?.database}

Phase 2 (${data.roadmap.phase2?.timeline}):
${data.roadmap.phase2?.features?.map(feature => `- ${feature}`).join('\n')}

Phase 3 (${data.roadmap.phase3?.timeline}):
${data.roadmap.phase3?.enterpriseFeatures?.map(feature => `- ${feature}`).join('\n')}

Resource Requirements:
- MVP Team: ${data.roadmap.resourceRequirements?.mvpTeam?.join(', ')}
- Development Hours: ${data.roadmap.resourceRequirements?.developmentHours}
- Budget Range: ${data.roadmap.resourceRequirements?.budgetRange}
- Key Skills: ${data.roadmap.resourceRequirements?.keySkills?.join(', ')}
` : 'Technical roadmap not yet generated. Click "Generate Technical Roadmap" to create detailed development plan.'}

MARKET VALIDATION DATA
----------------------
${data?.demandSignals ? `
Demand Signals:
- Search Trend: ${data.demandSignals?.searchTrend}
- Demand Score: ${data.demandSignals?.demandScore}/100
- Geographic Distribution: ${data.demandSignals?.geoDistribution?.slice(0, 3).join(', ')}
` : 'Market validation data not available.'}

---
Generated by IdeaForge - Your strategic co-pilot for SaaS idea validation.
Report Date: ${new Date().toISOString()}
    `.trim();
  };
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
                    {validationData.competitorAnalysis.marketGaps?.map((gap, index) => (
                      <li key={index} className="text-sm text-green-700 flex items-start">
                        <CheckCircle className="mr-1 mt-0.5" size={12} />
                        {gap}
                      </li>
                    )) || <li className="text-sm text-gray-500">No market gaps data available</li>}
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
        </div>

        {/* Sidebar - Validation Summary */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm sticky top-4">
            <h3 className="font-semibold text-lg mb-4 flex items-center">
              <Users className="mr-2 text-blue-500" size={20} />
              Validation Summary
            </h3>
            
            {validationData?.competitorAnalysis && (
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Competition</h4>
                  <div className="text-sm text-gray-600 space-y-1">
                    <div className="flex justify-between">
                      <span>Direct:</span>
                      <span className="font-medium">{validationData.competitorAnalysis.directCompetitors}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Indirect:</span>
                      <span className="font-medium">{validationData.competitorAnalysis.indirectCompetitors}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Avg Pricing:</span>
                      <span className="font-medium">{validationData.competitorAnalysis.averagePricing}</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium mb-2">Market Gaps</h4>
                  <ul className="text-sm text-gray-600 space-y-1">
                    {validationData.competitorAnalysis.marketGaps.slice(0, 3).map((gap, index) => (
                      <li key={index} className="flex items-start">
                        <span className="text-green-500 mr-2 mt-0.5">•</span>
                        {gap}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
            
            {validationData?.demandSignals && (
              <div className="mt-6 pt-4 border-t border-gray-200">
                <h4 className="font-medium mb-3">Demand Score</h4>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex-1 bg-gray-200 rounded-full h-2 mr-3">
                    <div 
                      className="bg-gradient-to-r from-green-400 to-blue-500 h-2 rounded-full"
                      style={{ width: `${validationData.demandSignals.demandScore}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium">{validationData.demandSignals.demandScore}/100</span>
                </div>
                <p className="text-xs text-gray-600">
                  Score: {validationData.demandSignals.demandScore}/100
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Full-width sections below the grid */}
      <div className="mt-8 space-y-8">
        {/* Target Audience Section */}
        {validationData?.loadingEnhancedInsights ? (
          <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
            <h3 className="font-semibold text-lg mb-4 flex items-center">
              <User className="mr-2 text-blue-500" size={20} />
              Target Audience
            </h3>
            <div className="flex items-center justify-center py-12">
              <Loader className="animate-spin mr-3 text-blue-500" size={24} />
              <span className="text-gray-600">Generating personalized audience insights...</span>
            </div>
          </div>
        ) : validationData?.targetAudience && (
            <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
              <h3 className="font-semibold text-lg mb-4 flex items-center">
                <User className="mr-2 text-blue-500" size={20} />
                Target Audience
              </h3>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium mb-3">Customer Persona</h4>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center mb-2">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                        <User className="text-blue-600" size={20} />
                      </div>
                      <div>
                        <h5 className="font-medium">{validationData.targetAudience.persona?.name}</h5>
                        <p className="text-sm text-gray-600">{validationData.targetAudience.persona?.jobTitle}</p>
                      </div>
                    </div>
                    <div className="text-sm text-gray-600 space-y-1">
                      <p><strong>Age:</strong> {validationData.targetAudience.persona?.ageRange}</p>
                      <p><strong>Company Size:</strong> {validationData.targetAudience.persona?.companySize}</p>
                      <p><strong>Tech Level:</strong> {validationData.targetAudience.persona?.techSkillLevel}</p>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium mb-3">Key Pain Points</h4>
                  <div className="space-y-3">
                    {validationData.targetAudience.painPoints?.slice(0, 3).map((pain, index) => (
                      <div key={index} className="bg-red-50 p-3 rounded-lg border-l-4 border-red-200">
                        <p className="font-medium text-sm text-red-800">{pain.problem}</p>
                        <p className="text-xs text-red-600 mt-1">Impact: {pain.impact}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="mt-4 pt-4 border-t border-gray-200">
                <div className="grid md:grid-cols-3 gap-4 text-sm">
                  <div>
                    <p className="font-medium text-gray-700">Budget Range</p>
                    <p className="text-gray-600">{validationData.targetAudience.buyingBehavior?.budgetRange}</p>
                  </div>
                  <div>
                    <p className="font-medium text-gray-700">Decision Makers</p>
                    <p className="text-gray-600">{validationData.targetAudience.buyingBehavior?.decisionMakers?.join(', ')}</p>
                  </div>
                  <div>
                    <p className="font-medium text-gray-700">Discovery Channels</p>
                    <p className="text-gray-600">{validationData.targetAudience.buyingBehavior?.discoveryChannels?.slice(0, 2).join(', ')}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Monetization Strategy Section */}
          {validationData?.loadingEnhancedInsights ? (
            <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
              <h3 className="font-semibold text-lg mb-4 flex items-center">
                <DollarSign className="mr-2 text-green-500" size={20} />
                Monetization Strategy
              </h3>
              <div className="flex items-center justify-center py-12">
                <Loader className="animate-spin mr-3 text-green-500" size={24} />
                <span className="text-gray-600">Generating pricing and revenue strategy...</span>
              </div>
            </div>
          ) : validationData?.monetizationStrategy && (
            <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
              <h3 className="font-semibold text-lg mb-4 flex items-center">
                <DollarSign className="mr-2 text-green-500" size={20} />
                Monetization Strategy
              </h3>
              
              <div className="mb-6">
                <h4 className="font-medium mb-2">Business Model</h4>
                <div className="bg-green-50 p-4 rounded-lg">
                  <p className="font-medium text-green-800">{validationData.monetizationStrategy.primaryModel?.type}</p>
                  <p className="text-sm text-green-600 mt-1">{validationData.monetizationStrategy.primaryModel?.justification}</p>
                </div>
              </div>
              
              <div className="mb-6">
                <h4 className="font-medium mb-3">Pricing Tiers</h4>
                <div className="grid md:grid-cols-3 gap-4">
                  {validationData.monetizationStrategy.pricingTiers?.map((tier, index) => (
                    <div key={index} className={`p-4 rounded-lg border-2 ${
                      index === 1 ? 'border-blue-300 bg-blue-50' : 'border-gray-200 bg-white'
                    }`}>
                      <div className="text-center">
                        <h5 className="font-medium">{tier.name}</h5>
                        <p className="text-2xl font-bold text-blue-600 my-2">{tier.monthlyPrice}</p>
                        <p className="text-xs text-gray-600 mb-3">{tier.targetSegment}</p>
                      </div>
                      <ul className="text-sm text-gray-600 space-y-1">
                        {tier.features?.slice(0, 3).map((feature, featureIndex) => (
                          <li key={featureIndex} className="flex items-center">
                            <CheckCircle className="mr-2 text-green-500" size={12} />
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium mb-3">Revenue Projections</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Year 1 MRR Target:</span>
                      <span className="font-medium">{validationData.monetizationStrategy.projections?.year1MRR}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Customer LTV:</span>
                      <span className="font-medium">{validationData.monetizationStrategy.projections?.estimatedLTV}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Break-even:</span>
                      <span className="font-medium">{validationData.monetizationStrategy.projections?.breakEvenTimeframe}</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium mb-3">Additional Revenue Streams</h4>
                  <div className="space-y-2">
                    {validationData.monetizationStrategy.secondaryStreams?.slice(0, 2).map((stream, index) => (
                      <div key={index} className="bg-gray-50 p-3 rounded-lg">
                        <p className="font-medium text-sm">{stream.name}</p>
                        <p className="text-xs text-gray-600">{stream.description}</p>
                        <p className="text-xs text-green-600 mt-1">{stream.revenueEstimate}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Technical Roadmap Section */}
          {validationData?.roadmap && (
            <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
              <h3 className="font-semibold text-lg mb-4 flex items-center">
                <Code className="mr-2 text-purple-500" size={20} />
                Technical Roadmap
              </h3>
              
              <div className="grid md:grid-cols-3 gap-6">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-purple-700 mb-2">MVP Phase</h4>
                    <p className="text-sm text-gray-600 mb-3">Timeline: {validationData.roadmap.mvp?.timeline}</p>
                    <div className="space-y-2">
                      <p className="text-xs font-medium text-gray-700">Core Features:</p>
                      <ul className="text-xs text-gray-600 space-y-1">
                        {validationData.roadmap.mvp?.coreFeatures?.slice(0, 4).map((feature, index) => (
                          <li key={index} className="flex items-center">
                            <div className="w-1.5 h-1.5 bg-purple-400 rounded-full mr-2"></div>
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                  
                  <div className="bg-purple-50 p-3 rounded-lg">
                    <p className="text-xs font-medium text-purple-700">Tech Stack</p>
                    <p className="text-xs text-purple-600 mt-1">
                      {validationData.roadmap.mvp?.techStack?.frontend}, {validationData.roadmap.mvp?.techStack?.backend}
                    </p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-blue-700 mb-2">Phase 2</h4>
                    <p className="text-sm text-gray-600 mb-3">Timeline: {validationData.roadmap.phase2?.timeline}</p>
                    <div className="space-y-2">
                      <p className="text-xs font-medium text-gray-700">New Features:</p>
                      <ul className="text-xs text-gray-600 space-y-1">
                        {validationData.roadmap.phase2?.features?.slice(0, 3).map((feature, index) => (
                          <li key={index} className="flex items-center">
                            <div className="w-1.5 h-1.5 bg-blue-400 rounded-full mr-2"></div>
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-green-700 mb-2">Phase 3</h4>
                    <p className="text-sm text-gray-600 mb-3">Timeline: {validationData.roadmap.phase3?.timeline}</p>
                    <div className="space-y-2">
                      <p className="text-xs font-medium text-gray-700">Enterprise Features:</p>
                      <ul className="text-xs text-gray-600 space-y-1">
                        {validationData.roadmap.phase3?.enterpriseFeatures?.slice(0, 3).map((feature, index) => (
                          <li key={index} className="flex items-center">
                            <div className="w-1.5 h-1.5 bg-green-400 rounded-full mr-2"></div>
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 pt-4 border-t border-gray-200">
                <div className="grid md:grid-cols-2 gap-6 text-sm">
                  <div>
                    <p className="font-medium text-gray-700 mb-2">Resource Requirements</p>
                    <div className="space-y-1 text-gray-600">
                      <p><strong>MVP Team:</strong> {validationData.roadmap.resourceRequirements?.mvpTeam?.join(', ')}</p>
                      <p><strong>Development Hours:</strong> {validationData.roadmap.resourceRequirements?.developmentHours}</p>
                      <p><strong>Budget Range:</strong> {validationData.roadmap.resourceRequirements?.budgetRange}</p>
                    </div>
                  </div>
                  <div>
                    <p className="font-medium text-gray-700 mb-2">Key Skills Needed</p>
                    <div className="flex flex-wrap gap-1">
                      {validationData.roadmap.resourceRequirements?.keySkills?.map((skill, index) => (
                        <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

        {/* Validation Playbook */}
        <ValidationPlaybook validationData={validationData} onExportReport={handleExportReport} />

        {/* Ready to Build Section */}
        <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl p-8 border border-purple-200">
          <div className="max-w-4xl mx-auto text-center">
            <h3 className="font-semibold text-2xl mb-3">Ready to Build?</h3>
            <p className="text-gray-600 mb-6">
              Market data shows this idea has strong potential. Time to turn insights into action.
            </p>
            
            <div className="grid md:grid-cols-2 gap-4 max-w-2xl mx-auto">
              <button 
                onClick={handleGenerateRoadmap}
                disabled={isGeneratingRoadmap || validationData?.roadmapGenerated}
                className="bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {isGeneratingRoadmap ? (
                  <>
                    <Loader className="animate-spin mr-2" size={18} />
                    Generating Roadmap...
                  </>
                ) : validationData?.roadmapGenerated ? (
                  <>
                    <CheckCircle className="mr-2" size={18} />
                    Roadmap Generated
                  </>
                ) : (
                  <>
                    <Code className="mr-2" size={18} />
                    Generate Technical Roadmap
                  </>
                )}
              </button>
              <button 
                onClick={handleExportReport}
                disabled={isExporting}
                className="border-2 border-purple-300 text-purple-700 py-3 px-6 rounded-lg font-medium hover:bg-purple-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
              >
                {isExporting ? (
                  <>
                    <Loader className="animate-spin mr-2" size={18} />
                    Exporting...
                  </>
                ) : (
                  <>
                    <Download className="mr-2" size={18} />
                    Export Validation Report
                  </>
                )}
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