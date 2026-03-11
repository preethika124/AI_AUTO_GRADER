def calculate_rubric_score(rubric_scores):
    
    total_score = 0
    
    for item in rubric_scores:
        total_score += item["score"]
        
    return total_score