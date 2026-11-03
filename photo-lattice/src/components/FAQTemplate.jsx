const faqTemplate={
 eyebrow:"FAQ",title:"Frequently Asked Questions",lead:"Using your Photo Lattice photography library.",
 faqs:[
  {question:"How do I add a photograph?",answer:"Open Photos, choose Add Photo, upload an image or enter an image URL, complete its details, and select Save. Uploaded images can be JPEG, PNG, WebP, GIF, or AVIF up to 25 MB."},
  {question:"How do albums, tags, and shoots connect?",answer:"Create the album, tag, shoot, or equipment record first. Then select it while adding or editing a photo. The saved photo details show those linked records."},
  {question:"What happens when I archive a photo?",answer:"It moves out of the active library into Archive. Restore returns it to Photos. Permanent deletion is available from Archive and removes the metadata record, while the uploaded image file remains on disk."},
  {question:"Will reminders send email?",answer:"Reminders are displayed in the app and on your dashboard. Email and background notifications are not enabled for photography reminders."},
  {question:"What does Export Records include?",answer:"The JSON download contains your photo metadata, albums, shoots, equipment, tags, and reminders. It does not include image files and is not a scheduled MongoDB backup. Import and restore are not available from that page."},
  {question:"Why can’t I delete an album or equipment record?",answer:"A linked record must first be removed from the photographs, shoots, or reminders using it. This prevents broken references."}
 ]
};
export default faqTemplate;
