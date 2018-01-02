import MarkdownControl from '~/template/MarkdownControl';

const BoldMarker = '**';

export default new MarkdownControl(
    'Bold',
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
