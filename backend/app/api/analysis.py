from typing import List, Optional
from fastapi import APIRouter, HTTPException, status
from app.models.schemas import (
    HealthResponse,
    ExpertResponse,
    InterviewQuestionResponse,
    QuestionAnalysisResponse,
    SupportingEvidenceItem,
    EvidenceCoverage,
)
from app.services.transcript_service import transcript_service

router = APIRouter(tags=["Analysis & Framework"])

# Curated evidence data matching the exact interview guide questions and transcripts
ANALYSIS_DATA = {
    1: {
        "ai_summary": (
            "Across all three European markets, robotic surgery adoption is steadily increasing but remains heavily concentrated in "
            "major university hospitals, large academic centres, and well-funded private institutions. Smaller regional hospitals "
            "and secondary trusts face severe capital bottlenecks and lag significantly."
        ),
        "evidence": [
            {
                "market": "France",
                "country": "France",
                "flag": "🇫🇷",
                "expert_name": "Dr. Jean Martin",
                "expert_role": "Head of Urology",
                "timestamp": "00:18",
                "exact_quote": "Adoption is growing, but it is still concentrated in larger academic hospitals and private centres with stronger capital budgets. Smaller regional hospitals are much slower.",
                "source": "Transcript_1_France.txt",
                "ai_answer": "Adoption is expanding steadily but remains concentrated in major academic hospitals and well-funded private centres."
            },
            {
                "market": "Germany",
                "country": "Germany",
                "flag": "🇩🇪",
                "expert_name": "Anna Keller",
                "expert_role": "Former Hospital Procurement Director",
                "timestamp": "00:16",
                "exact_quote": "It is growing, but adoption is quite uneven. Large university hospitals are much more advanced, while many smaller hospitals are still waiting.",
                "source": "Transcript_2_Germany.txt",
                "ai_answer": "Adoption displays marked geographic and institutional unevenness, with university clinics far ahead of regional facilities."
            },
            {
                "market": "United Kingdom",
                "country": "United Kingdom",
                "flag": "🇬🇧",
                "expert_name": "Dr. Emily Carter",
                "expert_role": "Consultant Urologist",
                "timestamp": "00:14",
                "exact_quote": "Adoption is increasing, and in some larger NHS trusts robotic surgery is becoming standard for selected procedures. But access still varies significantly by hospital.",
                "source": "Transcript_3_UK.txt",
                "ai_answer": "Robotic procedures are becoming standard within selected large NHS trusts, though overall hospital access remains variable."
            }
        ]
    },
    2: {
        "ai_summary": (
            "Capital acquisition approval and funding constraints represent the universal primary barrier across Europe. However, "
            "experts emphasize that capital approval is contingent on operational viability: proof of high surgical throughput, "
            "multi-surgeon capacity, and theatre staffing."
        ),
        "evidence": [
            {
                "market": "France",
                "country": "France",
                "flag": "🇫🇷",
                "expert_name": "Dr. Jean Martin",
                "expert_role": "Head of Urology",
                "timestamp": "01:20",
                "exact_quote": "The biggest issue is still capital budget approval. Hospitals may like the technology clinically, but purchasing committees need a strong economic case before approving a system.",
                "source": "Transcript_1_France.txt",
                "ai_answer": "Purchasing committees prioritize the economic case over pure clinical interest before committing capital budget."
            },
            {
                "market": "Germany",
                "country": "Germany",
                "flag": "🇩🇪",
                "expert_name": "Anna Keller",
                "expert_role": "Former Hospital Procurement Director",
                "timestamp": "01:10",
                "exact_quote": "Cost is the first barrier. These are large capital purchases, and hospital finances are under pressure. The second issue is proving that the system will be used enough.",
                "source": "Transcript_2_Germany.txt",
                "ai_answer": "Hospital financial strain makes initial capital cost a hurdle, paired with the burden of proving sufficient procedure volume."
            },
            {
                "market": "United Kingdom",
                "country": "United Kingdom",
                "flag": "🇬🇧",
                "expert_name": "Dr. Emily Carter",
                "expert_role": "Consultant Urologist",
                "timestamp": "01:05",
                "exact_quote": "Funding is important, but I would say training capacity is just as important. You can buy a system, but if you cannot train enough surgeons and theatre staff, adoption stalls.",
                "source": "Transcript_3_UK.txt",
                "ai_answer": "Beyond initial capital allocation, training capacity for surgeons and theatre teams is an equivalent operational bottleneck."
            }
        ]
    },
    3: {
        "ai_summary": (
            "Return on Investment (ROI) and Total Cost of Ownership (TCO) are pivotal in France and Germany, where finance and procurement "
            "teams demand rigorous payback models. In the UK, financial metrics are weighed in close balance with clinical strategy, length of stay, "
            "and surgeon recruitment."
        ),
        "evidence": [
            {
                "market": "France",
                "country": "France",
                "flag": "🇫🇷",
                "expert_name": "Dr. Jean Martin",
                "expert_role": "Head of Urology",
                "timestamp": "02:18",
                "exact_quote": "Very important. The clinical argument may get surgeons interested, but the finance team wants to understand utilisation, procedure volume, maintenance cost and whether the system will actually pay for itself.",
                "source": "Transcript_1_France.txt",
                "ai_answer": "Finance leadership scrutinizes utilization, maintenance overheads, and financial payback before approving requests."
            },
            {
                "market": "Germany",
                "country": "Germany",
                "flag": "🇩🇪",
                "expert_name": "Anna Keller",
                "expert_role": "Former Hospital Procurement Director",
                "timestamp": "02:08",
                "exact_quote": "We look at total cost of ownership, expected procedure volume, maintenance, service contracts and training requirements. A strong clinical case helps, but the economic case decides whether it gets approved.",
                "source": "Transcript_2_Germany.txt",
                "ai_answer": "Procurement evaluates total cost of ownership including maintenance and service contracts, which decisively dictates approval."
            },
            {
                "market": "United Kingdom",
                "country": "United Kingdom",
                "flag": "🇬🇧",
                "expert_name": "Dr. Emily Carter",
                "expert_role": "Consultant Urologist",
                "timestamp": "02:07",
                "exact_quote": "It matters, but the discussion is not always purely financial. Hospitals also consider patient outcomes, length of stay, surgeon recruitment and whether the technology improves their clinical position.",
                "source": "Transcript_3_UK.txt",
                "ai_answer": "Financial ROI is weighed alongside clinical strategy, reduced length of stay, and staff recruitment."
            }
        ]
    },
    4: {
        "ai_summary": (
            "Surgeon training is directly linked to financial sustainability and utilization. If only a single surgeon uses the robot, "
            "the business case collapses. Furthermore, while superior clinical outcomes are essential table stakes, they cannot justify "
            "an acquisition without sound economic backing."
        ),
        "evidence": [
            {
                "market": "France",
                "country": "France",
                "flag": "🇫🇷",
                "expert_name": "Dr. Jean Martin",
                "expert_role": "Head of Urology",
                "timestamp": "03:10",
                "exact_quote": "Training matters, especially in the first year. If only one surgeon can use the system, the economics become difficult. Hospitals want several surgeons trained so utilisation is high enough.",
                "source": "Transcript_1_France.txt",
                "ai_answer": "Training multiple surgeons is critical in year one to ensure high utilization and procedural throughput."
            },
            {
                "market": "Germany",
                "country": "Germany",
                "flag": "🇩🇪",
                "expert_name": "Anna Keller",
                "expert_role": "Former Hospital Procurement Director",
                "timestamp": "03:05",
                "exact_quote": "Very important operationally. If the hospital buys a system but only one surgeon is comfortable using it, utilisation will be poor. That weakens the business case.",
                "source": "Transcript_2_Germany.txt",
                "ai_answer": "Single-surgeon reliance severely depresses utilization rates and weakens the ongoing procurement business case."
            },
            {
                "market": "United Kingdom",
                "country": "United Kingdom",
                "flag": "🇬🇧",
                "expert_name": "Dr. Emily Carter",
                "expert_role": "Consultant Urologist",
                "timestamp": "06:04",
                "exact_quote": "The key point is that adoption is not just about buying the machine. Hospitals need enough trained people and enough procedure volume to make the programme sustainable.",
                "source": "Transcript_3_UK.txt",
                "ai_answer": "Long-term program sustainability requires broad theatre team training and guaranteed procedure volume."
            }
        ]
    },
    5: {
        "ai_summary": (
            "The 3-5 year growth forecast is characterized by steady, incremental expansion rather than explosive market-wide shifts. "
            "Expected procedure volume growth ranges between 10% to 20% annually in leading institutions, driven by competitive pricing and expanded training pipelines."
        ),
        "evidence": [
            {
                "market": "France",
                "country": "France",
                "flag": "🇫🇷",
                "expert_name": "Dr. Jean Martin",
                "expert_role": "Head of Urology",
                "timestamp": "05:07",
                "exact_quote": "I expect adoption to continue increasing, probably steadily rather than explosively. I would expect maybe 15 to 20 percent more procedures annually in some of the stronger centres, but smaller hospitals will remain slower.",
                "source": "Transcript_1_France.txt",
                "ai_answer": "Expects steady procedural growth around 15-20% annually in top centres, with smaller hospitals progressing more slowly."
            },
            {
                "market": "Germany",
                "country": "Germany",
                "flag": "🇩🇪",
                "expert_name": "Anna Keller",
                "expert_role": "Former Hospital Procurement Director",
                "timestamp": "05:08",
                "exact_quote": "I would expect continued growth, but probably closer to high single digits or low double digits in procedure volumes rather than something like 20 percent across the whole market.",
                "source": "Transcript_2_Germany.txt",
                "ai_answer": "Projects high single-digit to low double-digit procedure growth as hospitals balance competing capital priorities."
            },
            {
                "market": "United Kingdom",
                "country": "United Kingdom",
                "flag": "🇬🇧",
                "expert_name": "Dr. Emily Carter",
                "expert_role": "Consultant Urologist",
                "timestamp": "04:06",
                "exact_quote": "I am quite positive. I think adoption could accelerate if training expands and systems become more cost competitive. I could see procedure growth above 15 percent annually in some areas.",
                "source": "Transcript_3_UK.txt",
                "ai_answer": "Positive on adoption potential, anticipating >15% annual procedural growth if training scales and system costs decrease."
            }
        ]
    },
    6: {
        "ai_summary": (
            "Hospital purchasing decisions span between 6 to 18 months. Timelines are prolonged when capital committees defer approvals "
            "across annual budget cycles or when multiple clinical, procurement, and administrative stakeholders must establish consensus."
        ),
        "evidence": [
            {
                "market": "France",
                "country": "France",
                "flag": "🇫🇷",
                "expert_name": "Dr. Jean Martin",
                "expert_role": "Head of Urology",
                "timestamp": "06:08",
                "exact_quote": "Six to twelve months is realistic once the hospital becomes serious. It can be longer if the capital committee pushes the purchase into the next budget cycle.",
                "source": "Transcript_1_France.txt",
                "ai_answer": "Typically spans 6 to 12 months, with potential budget cycle deferrals adding significant delays."
            },
            {
                "market": "Germany",
                "country": "Germany",
                "flag": "🇩🇪",
                "expert_name": "Anna Keller",
                "expert_role": "Former Hospital Procurement Director",
                "timestamp": "06:05",
                "exact_quote": "Nine to eighteen months is common. Procurement, clinical leadership, finance and management all need to align, so it can move slowly.",
                "source": "Transcript_2_Germany.txt",
                "ai_answer": "Averages 9 to 18 months due to formal alignment across procurement, clinical heads, and executive leadership."
            },
            {
                "market": "United Kingdom",
                "country": "United Kingdom",
                "flag": "🇬🇧",
                "expert_name": "Dr. Emily Carter",
                "expert_role": "Consultant Urologist",
                "timestamp": "05:04",
                "exact_quote": "Around six to nine months can happen if funding is already available. If the trust has to wait for a new capital cycle, it can take much longer.",
                "source": "Transcript_3_UK.txt",
                "ai_answer": "Ranges 6 to 9 months when pre-allocated funding is in place, extending substantially if tied to NHS capital cycle bids."
            }
        ]
    }
}


@router.get("/health", response_model=HealthResponse)
def health_check():
    return HealthResponse(status="healthy")


@router.get("/experts", response_model=List[ExpertResponse])
def get_experts():
    return transcript_service.get_all_experts()


@router.get("/questions", response_model=List[InterviewQuestionResponse])
def get_questions():
    return transcript_service.get_interview_questions()


@router.get("/analysis/{question_id}", response_model=QuestionAnalysisResponse)
def get_analysis_by_question(question_id: int, market: Optional[str] = None):
    if question_id not in ANALYSIS_DATA:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Analysis for question {question_id} not found. Valid IDs: 1 to 6."
        )

    questions = transcript_service.get_interview_questions()
    q_meta = next((q for q in questions if q.id == question_id), None)
    question_text = q_meta.full_question if q_meta else f"Question {question_id}"

    data = ANALYSIS_DATA[question_id]
    evidence_list = [SupportingEvidenceItem(**e) for e in data["evidence"]]

    if market and market.lower() != "all":
        m_lower = market.lower()
        evidence_list = [e for e in evidence_list if e.market.lower() == m_lower or e.country.lower() == m_lower]

    return QuestionAnalysisResponse(
        question_id=question_id,
        question=question_text,
        ai_summary=data["ai_summary"],
        evidence_coverage=EvidenceCoverage(
            total_markets=3,
            markets_with_evidence=len(evidence_list),
            label=f"Evidence found in {len(evidence_list)} of 3 interviews"
        ),
        evidence_list=evidence_list
    )
