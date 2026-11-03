const aboutTemplate={
 eyebrow:"About",
 title:"About Eco Sphere",
 lead:"A shared micro-frontend workspace for opening, using, and moving between Barrow Enterprises applications from one connected experience.",
 sidebar:{
  eyebrow:"Application Overview",
  title:"One shell for every application",
  text:"Eco Sphere keeps application discovery, shared identity, navigation, and launch behavior in one place while each child application retains its own purpose, interface, backend, and data flow."
 },
 sections:[
  {
   heading:"Purpose",
   text:[
    "Eco Sphere is the main frontend entry point for the Barrow Enterprises application portfolio.",
    "It provides one organized dashboard where authorized users can find an application, launch it inside the shared workspace, and return to the application list without opening a separate browser workflow."
   ]
  },
  {
   heading:"How the Workspace Works",
   text:[
    "The Eco Sphere dashboard displays the available applications in an alphabetical, searchable card layout using each application's own logo and description.",
    "When an application is selected, Eco Sphere starts its configured local runtime when needed and loads it inside the application workspace."
   ]
  },
  {
   heading:"Shared and Local Responsibilities",
   text:[
    "Eco Sphere provides the shared shell, application directory, user session handoff, and return navigation.",
    "Each child application continues to own its pages, forms, routes, controllers, models, local backend, and application-specific MongoDB data. Shared business and identity records remain available through the global connection where configured."
   ]
  },
  {
   heading:"Core Features",
   list:[
    "One authenticated entry point for the application portfolio",
    "Alphabetical application dashboard with jump filters",
    "Application cards using each application's logo and description",
    "Lazy local runtime startup on configured unique ports",
    "Shared user-session handoff to supported child applications",
    "Embedded application workspace with a clear return path",
    "Business-token colors and fonts applied to the Eco Sphere shell"
   ]
  },
  {
   heading:"Design Principle",
   text:[
    "Eco Sphere coordinates the applications without flattening them into one generic product.",
    "Each application keeps its own identity and local data responsibilities while the host makes the overall portfolio easier to access, test, and manage."
   ]
  }
 ]
};

export default aboutTemplate;
