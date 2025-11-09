// User Feedback and Expert Escalation System
// Based on blueprint requirements for continuous learning and human-in-loop

export interface FeedbackData {
  responseId: string;
  userId: string;
  rating: 'helpful' | 'not_helpful' | 'partially_helpful';
  confidence: number;
  feedbackText?: string;
  correctDiagnosis?: string;
  actualOutcome?: string;
  timestamp: Date;
}

export interface EscalationCase {
  id: string;
  responseId: string;
  userId: string;
  originalQuery: string;
  images?: string[];
  aiResponse: string;
  confidence: number;
  reason: 'low_confidence' | 'user_correction' | 'safety_concern' | 'manual_request';
  status: 'pending' | 'assigned' | 'resolved';
  assignedExpert?: string;
  expertResponse?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  createdAt: Date;
  resolvedAt?: Date;
  metadata: {
    crop?: string;
    suspectedPest?: string;
    location?: string;
    season?: string;
  };
}

export interface ExpertFeedback {
  caseId: string;
  expertId: string;
  diagnosis: string;
  treatment: string;
  reasoning: string;
  confidence: number;
  followUpNeeded: boolean;
  trainingValue: 'high' | 'medium' | 'low'; // For model retraining
  timestamp: Date;
}

class FeedbackEscalationService {
  private feedbacks: FeedbackData[] = [];
  private escalationCases: EscalationCase[] = [];
  private expertFeedbacks: ExpertFeedback[] = [];

  // Collect user feedback on AI responses
  collectFeedback(feedback: Omit<FeedbackData, 'timestamp'>): string {
    const feedbackEntry: FeedbackData = {
      ...feedback,
      timestamp: new Date()
    };
    
    this.feedbacks.push(feedbackEntry);
    
    // Auto-escalate if negative feedback on high-confidence response
    if (feedback.rating === 'not_helpful' && feedback.confidence > 0.8) {
      this.createEscalationCase({
        responseId: feedback.responseId,
        userId: feedback.userId,
        reason: 'user_correction',
        priority: 'medium'
      });
    }

    return feedbackEntry.timestamp.toISOString();
  }

  // Create escalation case for human expert review
  createEscalationCase(params: {
    responseId: string;
    userId: string;
    originalQuery?: string;
    images?: string[];
    aiResponse?: string;
    confidence?: number;
    reason: EscalationCase['reason'];
    priority?: EscalationCase['priority'];
    metadata?: EscalationCase['metadata'];
  }): string {
    const escalationCase: EscalationCase = {
      id: `ESC_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      responseId: params.responseId,
      userId: params.userId,
      originalQuery: params.originalQuery || '',
      images: params.images || [],
      aiResponse: params.aiResponse || '',
      confidence: params.confidence || 0,
      reason: params.reason,
      status: 'pending',
      priority: params.priority || this.determinePriority(params.reason, params.confidence),
      createdAt: new Date(),
      metadata: params.metadata || {}
    };

    this.escalationCases.push(escalationCase);

    // Send notification to appropriate expert
    this.notifyExpertTeam(escalationCase);

    return escalationCase.id;
  }

  // Determine priority based on escalation reason and confidence
  private determinePriority(
    reason: EscalationCase['reason'], 
    confidence?: number
  ): EscalationCase['priority'] {
    switch (reason) {
      case 'safety_concern':
        return 'urgent';
      case 'low_confidence':
        return confidence && confidence < 0.4 ? 'high' : 'medium';
      case 'user_correction':
        return 'medium';
      case 'manual_request':
        return 'low';
      default:
        return 'medium';
    }
  }

  // Notify expert team about new escalation
  private notifyExpertTeam(case_: EscalationCase): void {
    // In production: send SMS/email/Slack notification
    console.log(`🚨 Escalation Alert - ${case_.priority.toUpperCase()} Priority`);
    console.log(`Case ID: ${case_.id}`);
    console.log(`Reason: ${case_.reason}`);
    console.log(`Confidence: ${case_.confidence * 100}%`);
    
    if (case_.priority === 'urgent') {
      console.log(`⚠️ URGENT: Requires immediate expert attention within 2 hours`);
    }
  }

  // Expert submits response to escalation case
  submitExpertFeedback(feedback: Omit<ExpertFeedback, 'timestamp'>): void {
    const expertFeedback: ExpertFeedback = {
      ...feedback,
      timestamp: new Date()
    };

    this.expertFeedbacks.push(expertFeedback);

    // Update escalation case status
    const escalationCase = this.escalationCases.find(c => c.id === feedback.caseId);
    if (escalationCase) {
      escalationCase.status = 'resolved';
      escalationCase.resolvedAt = new Date();
      escalationCase.expertResponse = feedback.diagnosis + '\n\n' + feedback.treatment;
    }

    // Queue for model retraining if high training value
    if (expertFeedback.trainingValue === 'high') {
      this.queueForRetraining(expertFeedback);
    }
  }

  // Queue expert feedback for model retraining
  private queueForRetraining(feedback: ExpertFeedback): void {
    console.log(`📚 Queued for retraining: Case ${feedback.caseId}`);
    // In production: add to retraining dataset
  }

  // Get escalation cases for expert dashboard
  getEscalationCases(
    status?: EscalationCase['status'],
    priority?: EscalationCase['priority']
  ): EscalationCase[] {
    return this.escalationCases.filter(case_ => {
      if (status && case_.status !== status) return false;
      if (priority && case_.priority !== priority) return false;
      return true;
    }).sort((a, b) => {
      // Sort by priority and creation date
      const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 };
      if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      }
      return b.createdAt.getTime() - a.createdAt.getTime();
    });
  }

  // Get feedback analytics for monitoring
  getFeedbackAnalytics(days: number = 7): {
    totalFeedbacks: number;
    helpfulPercentage: number;
    averageConfidence: number;
    escalationRate: number;
    topIssues: string[];
  } {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    const recentFeedbacks = this.feedbacks.filter(f => f.timestamp > cutoffDate);
    const recentEscalations = this.escalationCases.filter(c => c.createdAt > cutoffDate);

    const helpfulCount = recentFeedbacks.filter(f => f.rating === 'helpful').length;
    const totalConfidence = recentFeedbacks.reduce((sum, f) => sum + f.confidence, 0);
    
    return {
      totalFeedbacks: recentFeedbacks.length,
      helpfulPercentage: recentFeedbacks.length > 0 ? (helpfulCount / recentFeedbacks.length) * 100 : 0,
      averageConfidence: recentFeedbacks.length > 0 ? totalConfidence / recentFeedbacks.length : 0,
      escalationRate: recentFeedbacks.length > 0 ? (recentEscalations.length / recentFeedbacks.length) * 100 : 0,
      topIssues: this.getTopEscalationReasons(recentEscalations)
    };
  }

  private getTopEscalationReasons(escalations: EscalationCase[]): string[] {
    const reasonCounts = escalations.reduce((counts, case_) => {
      counts[case_.reason] = (counts[case_.reason] || 0) + 1;
      return counts;
    }, {} as Record<string, number>);

    return Object.entries(reasonCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([reason]) => reason);
  }
}

// Export singleton instance
export const feedbackEscalationService = new FeedbackEscalationService();

// Helper function to integrate with existing chat responses
export function createFeedbackButtons(responseId: string, userId: string): {
  helpful: () => void;
  notHelpful: () => void;
  requestExpert: () => void;
} {
  return {
    helpful: () => {
      feedbackEscalationService.collectFeedback({
        responseId,
        userId,
        rating: 'helpful',
        confidence: 0.8 // Assume decent confidence for helpful responses
      });
    },
    notHelpful: () => {
      feedbackEscalationService.collectFeedback({
        responseId,
        userId,
        rating: 'not_helpful',
        confidence: 0.6
      });
    },
    requestExpert: () => {
      feedbackEscalationService.createEscalationCase({
        responseId,
        userId,
        reason: 'manual_request',
        priority: 'medium'
      });
    }
  };
}

// Expert escalation UI helpers
export function formatEscalationForDisplay(case_: EscalationCase): string {
  return `
**Escalation Case: ${case_.id}**
Priority: ${case_.priority.toUpperCase()}
Reason: ${case_.reason.replace('_', ' ')}
Confidence: ${(case_.confidence * 100).toFixed(0)}%
Status: ${case_.status}

**Original Query:**
${case_.originalQuery}

**AI Response:**
${case_.aiResponse}

**Metadata:**
Crop: ${case_.metadata.crop || 'Unknown'}
Location: ${case_.metadata.location || 'Unknown'}
Created: ${case_.createdAt.toLocaleString()}
  `.trim();
}
