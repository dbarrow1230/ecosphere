const faqTemplate={
 eyebrow:"FAQ",
 title:"Frequently Asked Questions",
 lead:"Common questions about using Eco Sphere as the shared micro-frontend workspace for Barrow Enterprises applications.",
 groups:[
  {
   name:"Start",
   label:"Getting Started",
   faqs:[
    {
     question:"What is Eco Sphere?",
     answer:"Eco Sphere is the main frontend workspace for the Barrow Enterprises application portfolio. It lets you find and open supported applications from one dashboard."
    },
    {
     question:"How do I open an application?",
     answer:"Sign in, open the Applications dashboard, then select the application's card. Eco Sphere prepares the configured runtime and loads the application inside the shared workspace."
    },
    {
     question:"How do I return to the application list?",
     answer:"Use the Return to Applications control displayed above the active child application."
    }
   ]
  },
  {
   name:"Apps",
   label:"Applications",
   faqs:[
    {
     question:"Why does every application look different?",
     answer:"Each child application keeps its own logo, colors, navigation, pages, and workflow. Eco Sphere is the shared host, not a redesign of every application."
    },
    {
     question:"Why are applications assigned different ports?",
     answer:"Every frontend and backend needs its own configured port so multiple applications can run locally without competing for the same address."
    },
    {
     question:"Does selecting an application open a new browser page?",
     answer:"No. Supported applications load within the Eco Sphere application workspace so the user remains inside the shared frontend flow."
    },
    {
     question:"What happens if an application is not running?",
     answer:"Eco Sphere can start the configured child backend and frontend when the application is selected. If startup fails, the workspace reports the failure without replacing the application with dummy content."
    }
   ]
  },
  {
   name:"Access",
   label:"Accounts & Access",
   faqs:[
    {
     question:"Do I need to sign in to every child application?",
     answer:"Supported child applications receive the Eco Sphere session handoff so the same authenticated user can continue without signing in again."
    },
    {
     question:"Why can some users see the Admin menu?",
     answer:"Administrative navigation is shown according to the user's assigned owner, administrator, or manager access in the shared role data."
    },
    {
     question:"Does Eco Sphere replace each application's permissions?",
     answer:"No. Eco Sphere passes the shared identity, but each application can still enforce its own protected routes and authorization rules."
    }
   ]
  },
  {
   name:"Data",
   label:"Backends & Data",
   faqs:[
    {
     question:"Does every application use the same database?",
     answer:"No. Each child application can use its own local MongoDB database for application-specific records while shared business, reference, or identity data can use the configured global connection."
    },
    {
     question:"Does Eco Sphere change MongoDB startup or data paths?",
     answer:"No. Eco Sphere uses the configured application connections and does not replace the existing MongoDB startup script or local data path."
    },
    {
     question:"Where do application forms save their data?",
     answer:"Forms save through the selected application's own frontend API calls, routes, controllers, models, and configured MongoDB connection."
    }
   ]
  },
  {
   name:"Theme",
   label:"Branding & Theme",
   faqs:[
    {
     question:"Where do Eco Sphere colors and fonts come from?",
     answer:"Eco Sphere loads its semantic color and font values from the theme tokens stored on its shared business record."
    },
    {
     question:"Does the Eco Sphere theme replace child application themes?",
     answer:"No. The business tokens style the Eco Sphere shell. Each child application retains its own brand and presentation when it is loaded."
    }
   ]
  }
 ]
};

export default faqTemplate;
