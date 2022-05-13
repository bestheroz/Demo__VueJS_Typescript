import ClassicEditorBase from "@ckeditor/ckeditor5-editor-classic/src/classiceditor";

import Essentials from "@ckeditor/ckeditor5-essentials/src/essentials";
import Bold from "@ckeditor/ckeditor5-basic-styles/src/bold";
import Italic from "@ckeditor/ckeditor5-basic-styles/src/italic";
import BlockQuote from "@ckeditor/ckeditor5-block-quote/src/blockquote";
import Heading from "@ckeditor/ckeditor5-heading/src/heading";
import Image from "@ckeditor/ckeditor5-image/src/image";
import ImageInsert from "@ckeditor/ckeditor5-image/src/imageinsert";
import ImageCaption from "@ckeditor/ckeditor5-image/src/imagecaption";
import ImageToolbar from "@ckeditor/ckeditor5-image/src/imagetoolbar";
import ImageResize from "@ckeditor/ckeditor5-image/src/imageresize/imageresizebuttons";
import ImageResizeEditing from "@ckeditor/ckeditor5-image/src/imageresize/imageresizeediting";
import ImageResizeHandles from "@ckeditor/ckeditor5-image/src/imageresize/imageresizehandles";

import Link from "@ckeditor/ckeditor5-link/src/link";
import List from "@ckeditor/ckeditor5-list/src/list";
import Paragraph from "@ckeditor/ckeditor5-paragraph/src/paragraph";

import Alignment from "@ckeditor/ckeditor5-alignment/src/alignment";
import Strikethrough from "@ckeditor/ckeditor5-basic-styles/src/strikethrough";
import Underline from "@ckeditor/ckeditor5-basic-styles/src/underline";
import Table from "@ckeditor/ckeditor5-table/src/table";
import TableToolbar from "@ckeditor/ckeditor5-table/src/tabletoolbar";
import TableCaption from "@ckeditor/ckeditor5-table/src/tablecaption";
import TableProperties from "@ckeditor/ckeditor5-table/src/tableproperties";
import TableCellProperties from "@ckeditor/ckeditor5-table/src/tablecellproperties";
import GeneralHtmlSupport from "@ckeditor/ckeditor5-html-support/src/generalhtmlsupport";
import HtmlEmbed from "@ckeditor/ckeditor5-html-embed/src/htmlembed";
import HorizontalLine from "@ckeditor/ckeditor5-horizontal-line/src/horizontalline";
import Font from "@ckeditor/ckeditor5-font/src/font";

import envs from "@/constants/envs";
import { getValidatedAccessToken } from "@/utils/commands";
import {
  FileLoader,
  UploadAdapter,
} from "@ckeditor/ckeditor5-upload/src/filerepository";
import { Editor } from "@ckeditor/ckeditor5-core";

class MyUploadAdapter implements UploadAdapter {
  loader: FileLoader;
  xhr: XMLHttpRequest;
  constructor(loader: FileLoader) {
    // The file loader instance to use during the upload.
    this.loader = loader;
    this.xhr = new XMLHttpRequest();
  }

  // Starts the upload process.
  upload() {
    return this.loader.file.then(
      (file: File | null) =>
        new Promise((resolve, reject) => {
          this._initRequest();
          if (file) {
            this._initListeners(resolve, reject, file);
            this._sendRequest(file).then();
          }
        }),
    ) as Promise<Record<string, string>>;
  }

  // Aborts the upload process.
  abort() {
    if (this.xhr) {
      this.xhr.abort();
    }
  }

  // Initializes the XMLHttpRequest object using the URL passed to the constructor.
  _initRequest() {
    // Note that your request may look different. It is up to you and your editor
    // integration to choose the right communication channel. This example uses
    // a POST request with JSON as a data structure but your configuration
    // could be different.
    this.xhr.open("POST", `${envs.FILE_API_HOST}api/s3-files/`, true);
    this.xhr.responseType = "json";
  }

  // Initializes XMLHttpRequest listeners.
  _initListeners(
    resolve: CallableFunction,
    reject: CallableFunction,
    file: File,
  ) {
    const genericErrorText = `Couldn't upload file: ${file.name}.`;

    this.xhr.addEventListener("error", () => reject(genericErrorText));
    this.xhr.addEventListener("abort", () => reject());
    this.xhr.addEventListener("load", () => {
      const response = this.xhr.response;

      // This example assumes the XHR server's "response" object will come with
      // an "error" which has its own "message" that can be passed to reject()
      // in the upload promise.
      //
      // Your integration may handle upload errors in a different way so make sure
      // it is done properly. The reject() function must be called when the upload fails.
      if (!response || response.error) {
        return reject(
          response && response.error
            ? response.error.message
            : genericErrorText,
        );
      }

      // If the upload is successful, resolve the upload promise with an object containing
      // at least the "default" URL, pointing to the image on the server.
      // This URL will be used to display the image in the content. Learn more in the
      // UploadAdapter#upload documentation.
      resolve({
        default: response.data,
      });
    });

    // Upload progress when it is supported. The file loader has the #uploadTotal and #uploaded
    // properties which are used e.g. to display the upload progress bar in the editor
    // user interface.
    if (this.xhr.upload) {
      this.xhr.upload.addEventListener("progress", (evt: ProgressEvent) => {
        if (evt.lengthComputable) {
          this.loader.uploadTotal = evt.total;
          this.loader.uploaded = evt.loaded;
        }
      });
    }
  }

  // Prepares the data and sends the request.
  async _sendRequest(file: File) {
    // Prepare the form data.
    const data = new FormData();

    data.append("file", file);
    data.append("path", "text-editor");

    // Important note: This is the right place to implement security mechanisms
    // like authentication and CSRF protection. For instance, you can use
    // XMLHttpRequest.setRequestHeader() to set the request headers containing
    // the CSRF token generated earlier by your application.
    this.xhr.setRequestHeader("Authorization", await getValidatedAccessToken());

    // Send the request.
    this.xhr.send(data);
  }
}

function MyCustomUploadAdapterPlugin(editor: Editor) {
  editor.plugins.get("FileRepository").createUploadAdapter = (
    loader: FileLoader,
  ) => {
    // Configure the URL to the upload script in your back-end here!
    return new MyUploadAdapter(loader);
  };
}

export default class ClassicEditor extends ClassicEditorBase {}

ClassicEditor.builtinPlugins = [
  Essentials,
  Bold,
  Italic,
  BlockQuote,
  Heading,
  Image,
  ImageInsert,
  ImageCaption,
  ImageToolbar,
  ImageResize,
  ImageResizeEditing,
  ImageResizeHandles,
  Link,
  List,
  Paragraph,
  Alignment, // <--- ADDED
  Strikethrough,
  Underline,
  Table,
  TableToolbar,
  TableCaption,
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  MyCustomUploadAdapterPlugin,
  GeneralHtmlSupport,
  HtmlEmbed,
  HorizontalLine,
  Font,
  TableProperties,
  TableCellProperties,
];

// Editor configuration.
ClassicEditor.defaultConfig = {
  // This value must be kept in sync with the language defined in webpack.config.js.
  language: "ko",
  toolbar: {
    items: [
      "heading",
      "|",
      "alignment:left",
      "alignment:center",
      "alignment:right",
      "alignment:justify",
      "|",
      "fontColor",
      "bold",
      "italic",
      "strikethrough",
      "underline",
      "|",
      "bulletedList",
      "numberedList",
      "|",
      "blockQuote",
      "horizontalLine",
      "|",
      "insertImage",
      "link",
      "insertTable",
      "|",
      "htmlEmbed",
      "|",
      "undo",
      "redo",
      "|",
    ],
  },
  image: {
    resizeUnit: "%",
    resizeOptions: [
      {
        name: "resizeImage:original",
        value: null,
        icon: "original",
      },
      {
        name: "resizeImage:25",
        value: "25",
        icon: "small",
      },
      {
        name: "resizeImage:50",
        value: "50",
        icon: "medium",
      },
      {
        name: "resizeImage:75",
        value: "75",
        icon: "large",
      },
      {
        name: "resizeImage:100",
        value: "100",
        icon: "large",
      },
    ],
    toolbar: [
      "resizeImage",
      "|",
      "toggleImageCaption",
      "|",
      "imageTextAlternative",
    ],
  },
  table: {
    contentToolbar: [
      "toggleTableCaption",
      "tableColumn",
      "tableRow",
      "mergeTableCells",
      "tableProperties",
      "tableCellProperties",
    ],
  },
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  htmlSupport: {
    allow: [
      {
        name: /.*/,
        attributes: true,
        classes: true,
        styles: true,
      },
    ],
  },
};
