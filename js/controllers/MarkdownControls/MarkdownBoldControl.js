import { MarkdownControlBuilder } from '~/template/MarkdownControl';

const BoldMarker = '**';

export default MarkdownControlBuilder(
    'Bold',
    'b',
    'bold',
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
