import AnswerViewController from '~/controllers/AnswerViewController';
import { forEach } from '~/modern/array';

AnswerViewController.forClass(
    'answer',
    answer => [answer, answer.dataset.id]
)
