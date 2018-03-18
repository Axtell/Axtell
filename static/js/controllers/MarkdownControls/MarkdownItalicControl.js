import { MarkdownControlBuilder } from '~/template/MarkdownControl';

const ItalicMarker = '_';

export default MarkdownControlBuilder(
    'Italic',
    'i',
    'italic',
    (controller) => {
        if (controller.isLeading(ItalicMarker) && controller.isTrailing(ItalicMarker)) {
            controller.cutStart(ItalicMarker.length);
            controller.cutEnd(ItalicMarker.length);
        } else {
            controller.insertAtSelectionStart(ItalicMarker);
            controller.insertAtSelectionEnd(ItalicMarker);
        }
    }
);
