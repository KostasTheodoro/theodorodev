export type Lang = "en" | "el";

export const languages: Record<Lang, string> = {
  en: "English",
  el: "Ελληνικά",
};

export const defaultLang: Lang = "en";

// Mono/code-styled decorations (Hero IDE snippet, availability pill, `//` eyebrows)
// intentionally stay in English on both locales — see CLAUDE.md 2.2, they're code-ish
// details, not translatable prose.
const en = {
  "nav.projects": "Projects",
  "nav.about": "About",
  "nav.contact": "Contact",

  "footer.builtWith": "Built with",
  "footer.rights": "All rights reserved",

  "switch.aria": "Switch to Greek",

  "hero.titleLine1": "I build websites people",
  "hero.titleAccent": "actually want to use.",
  "hero.subtext":
    "Fast, modern, and built to last, with React, Next.js, and whatever gets the job done right. Got an idea? I'm in.",
  "hero.cta": "Get in touch",

  "home.workEyebrow": "// work",
  "home.workHeading": "My work",
  "home.viewAllProjects": "View all projects",
  "home.aboutEyebrow": "// about",
  "home.aboutHeading": "About",
  "home.aboutTeaser":
    "I'm Kostas, a developer based in Athens. I specialize in the React ecosystem, and I'm always looking for new challenges and projects.",
  "home.moreAboutMe": "More about me",
  "home.aboutAvatarAlt": "Portrait of Kostas Theodoropoulos",

  "meta.home.title": "Kostas Theodoropoulos, web developer, Athens",
  "meta.home.description":
    "I build fast websites and apps with React, Next.js, Tailwind and more. Deployed with Vercel, for client work and my own projects.",
  "meta.about.title": "About - Kostas Theodoropoulos",
  "meta.about.description":
    "Kostas Theodoropoulos is a developer based in Athens, building fast websites and apps with React, Next.js, Tailwind and more. Deployed with Vercel, for clients and personal projects.",
  "meta.contact.title": "Contact - Kostas Theodoropoulos",
  "meta.contact.description":
    "Get in touch and let's make your idea a reality - email, phone, WhatsApp, or the form below.",
  "meta.projects.title": "Projects - Kostas Theodoropoulos",
  "meta.projects.description":
    "Websites and apps I've built for clients and myself. Fast, SEO-focused, and built to score well on Lighthouse.",

  "about.heading": "About",
  "about.ctaPre": "Maybe your idea is our next project,",
  "about.ctaWork": "check my work",
  "about.ctaMid": "and",
  "about.ctaContact": "get in touch",

  "contact.heading": "Contact me",

  "projectsIndex.heading": "Projects",

  "project.year": "Year of first development:",
  "project.stack": "Stack:",
  "project.visitSite": "Visit live site",

  "form.labelFirstName": "First Name",
  "form.labelLastName": "Last Name",
  "form.labelEmail": "Email",
  "form.labelPhone": "Phone",
  "form.labelMessage": "Message",
  "form.optional": "(optional)",
  "form.placeholderFirstName": "Your first name",
  "form.placeholderLastName": "Your last name",
  "form.placeholderEmail": "Your email",
  "form.placeholderPhone": "e.g. 2101234567",
  "form.placeholderMessage": "Write your message here...",
  "form.required": "This field is required",
  "form.invalidEmail": "Please enter a valid email address",
  "form.send": "Send Message",
  "form.sending": "Sending…",
  "form.successToast": "Your message has been sent successfully.",
  "form.fallbackError":
    "Failed to send message. Please try another contact method.",
  "form.validationError": "Please fill in all fields with a valid email.",
  "form.notConfigured":
    "The contact form isn't wired up to send email yet. Please reach out at {{email}} for now.",
} as const;

// TODO: review copy — Greek drafts, owner to refine
const el: Record<keyof typeof en, string> = {
  "nav.projects": "Έργα",
  "nav.about": "Σχετικά με μένα",
  "nav.contact": "Επικοινωνία",

  "footer.builtWith": "Built with",
  "footer.rights": "All rights reserved",

  "switch.aria": "Αλλαγή σε Αγγλικά",

  "hero.titleLine1": "Φτιάχνω ιστοσελίδες που ο κόσμος",
  "hero.titleAccent": "θέλει πραγματικά να χρησιμοποιεί.",
  "hero.subtext":
    "Γρήγορες και σύγχρονες ιστοσελίδες φτιαγμένες να αντέχουν στον χρόνο, με React, Next.js και ό,τι χρειαστεί για να γίνει σωστά η δουλειά. Έχεις μια ιδέα; Είμαι μέσα.",
  "hero.cta": "Επικοινώνησε μαζί μου",

  "home.workEyebrow": "// work",
  "home.workHeading": "Η δουλειά μου",
  "home.viewAllProjects": "Όλα τα έργα μου",
  "home.aboutEyebrow": "// about",
  "home.aboutHeading": "Σχετικά με μένα",
  "home.aboutTeaser":
    "Είμαι ο Κώστας, web developer με έδρα την Αθήνα. Μου αρέσει να φτιάχνω ιστοσελίδες και εφαρμογές που είναι απλές στη χρήση και σωστά υλοποιημένες. Όταν αναλαμβάνω ένα project, προσπαθώ να δώσω σημασία στις λεπτομέρειες και όχι μόνο στο τελικό αποτέλεσμα",
  "home.moreAboutMe": "Περισσότερα για μένα",
  "home.aboutAvatarAlt": "Πορτρέτο του Κώστα Θεοδωρόπουλου",

  "meta.home.title": "Κώστας Θεοδωρόπουλος, web developer, Αθήνα",
  "meta.home.description":
    "Φτιάχνω γρήγορες ιστοσελίδες και εφαρμογές με React, Next.js, Tailwind και άλλα εργαλεία. Deployment με Vercel, για πελάτες αλλά και δικά μου projects.",
  "meta.about.title": "Σχετικά με μένα - Κώστας Θεοδωρόπουλος",
  "meta.about.description":
    "Ο Κώστας Θεοδωρόπουλος είναι developer με έδρα την Αθήνα, φτιάχνει γρήγορες ιστοσελίδες και εφαρμογές με React, Next.js, Tailwind και άλλα εργαλεία. Deployment με Vercel, για πελάτες και προσωπικά projects.",
  "meta.contact.title": "Επικοινωνία - Κώστας Θεοδωρόπουλος",
  "meta.contact.description":
    "Επικοινωνήστε μαζί μου για να κάνουμε την ιδέα σας πραγματικότητα - email, τηλέφωνο, WhatsApp ή συμπληρώστε την φόρμα.",
  "meta.projects.title": "Έργα - Κώστας Θεοδωρόπουλος",
  "meta.projects.description":
    "Ιστοσελίδες και εφαρμογές που έχω φτιάξει για πελάτες και για μένα. Γρήγορες, με εξαιρετικό SEO και με καλές επιδόσεις στο Lighthouse.",

  "about.heading": "Σχετικά με μένα",
  "about.ctaPre": "Ίσως η ιδέα σου να είναι το επόμενο έργο μας,",
  "about.ctaWork": "δες τη δουλειά μου",
  "about.ctaMid": "και",
  "about.ctaContact": "επικοινώνησε μαζί μου",

  "contact.heading": "Επικοινώνησε μαζί μου",

  "projectsIndex.heading": "Έργα",

  "project.year": "Έτος κατασκευής:",
  "project.stack": "Τεχνολογίες:",
  "project.visitSite": "Επίσκεψη στην ιστοσελίδα",

  "form.labelFirstName": "Όνομα",
  "form.labelLastName": "Επώνυμο",
  "form.labelEmail": "Email",
  "form.labelPhone": "Τηλέφωνο",
  "form.labelMessage": "Μήνυμα",
  "form.optional": "(προαιρετικό)",
  "form.placeholderFirstName": "Το όνομά σου",
  "form.placeholderLastName": "Το επώνυμό σου",
  "form.placeholderEmail": "Το email σου",
  "form.placeholderPhone": "π.χ. 2101234567",
  "form.placeholderMessage": "Γράψε το μήνυμά σου εδώ...",
  "form.required": "Αυτό το πεδίο είναι υποχρεωτικό",
  "form.invalidEmail": "Παρακαλώ εισάγετε έγκυρη διεύθυνση email",
  "form.send": "Αποστολή μηνύματος",
  "form.sending": "Αποστολή…",
  "form.successToast": "Το μήνυμά σας στάλθηκε με επιτυχία.",
  "form.fallbackError":
    "Αποτυχία αποστολής μηνύματος. Δοκιμάστε άλλον τρόπο επικοινωνίας.",
  "form.validationError": "Συμπλήρωσε όλα τα πεδία με ένα έγκυρο email.",
  "form.notConfigured":
    "Η φόρμα επικοινωνίας δεν είναι ακόμα συνδεδεμένη για αποστολή email. Επικοινώνησε προς το παρόν στο {{email}}.",
};

export const ui = { en, el };
export type UiKey = keyof typeof en;
