from app.models.Answer import Answer

def get_outgolfed_users(new_answer):
    return {answer.user for answer in Answer.query.\
        filter(
            Answer.post_id == new_answer.post_id,
            Answer.user_id != new_answer.user_id,
            Answer.language_name == new_answer.language_name,
            Answer.byte_len > new_answer.byte_len)
    }
