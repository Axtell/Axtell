import { MarkdownControlBuilder } from '~/template/MarkdownControl';

const BoldMarker = '~~';

export default MarkdownControlBuilder(
    'Strikethrough',
    's',
    'Strikethrough',
    (controller) => {
        if (controller.isLeading(BoldMarker) && controller.isTrailing(BoldMarker)) {
            controller.cutStart(BoldMarker.length);
            controller.cutEnd(BoldMarker.length);
        } else {
            controller.insertAtSelectionStart(BoldMarker);
            controller.insertAtSelectionEnd(BoldMarker);
        }
    }
);
