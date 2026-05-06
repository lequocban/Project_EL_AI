import { useState, useRef } from "react";
import {
  Clock,
  ArrowLeft,
  RotateCcw,
  CheckCircle,
  XCircle,
  Volume2,
  Play,
  Square,
  Lock,
  ChevronRight,
} from "lucide-react";

// ====== QUESTION DATA ======
const PART1 = Array.from({ length: 6 }, (_, i) => ({
  id: `p1_${i + 1}`,
  part: 1,
  partLabel: "Part 1: Mô tả ảnh",
  imageUrl: [
    "https://images.unsplash.com/photo-1497366216548-37526070297c?w=600",
    "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600",
    "https://images.unsplash.com/photo-1521791136064-7986c2920216?w=600",
    "https://images.unsplash.com/photo-1600880292203-757bb62b4baf?w=600",
    "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=600",
    "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=600",
  ][i],
  audioText: [
    "Two people are working at desks in an office.",
    "A man is looking at his phone outside.",
    "People are shaking hands at a meeting.",
    "Employees are collaborating in an open workspace.",
    "A woman is presenting in a conference room.",
    "A professional is reviewing documents.",
  ][i],
  question: `Look at the photograph. Choose the statement that best describes it.`,
  options: [
    [
      "Two people are shaking hands in an office.",
      "A woman is typing on a keyboard.",
      "Several boxes are stacked near a door.",
      "A man is presenting in a meeting room.",
    ],
    [
      "A man is sitting at a café.",
      "He is reading a newspaper.",
      "He is looking at his phone.",
      "A woman is walking past him.",
    ],
    [
      "People are shaking hands.",
      "A meeting is being canceled.",
      "Someone is giving a speech.",
      "People are eating lunch together.",
    ],
    [
      "Employees are collaborating.",
      "The office is empty.",
      "Someone is sleeping at a desk.",
      "A manager is scolding an employee.",
    ],
    [
      "A woman is presenting.",
      "The room is empty.",
      "People are leaving the room.",
      "A man is writing on a whiteboard.",
    ],
    [
      "A person is reviewing documents.",
      "Someone is sleeping.",
      "A desk is being moved.",
      "Papers are being shredded.",
    ],
  ][i],
  correct: i % 4 === 0 ? 0 : i % 4 === 1 ? 2 : i % 4 === 2 ? 0 : i % 4,
  explanation:
    "Choose the statement that most accurately describes the photograph.",
}));

const PART2_DATA = [
  {
    q: "Where is the nearest copy machine?",
    opts: [
      "It's down the hall on the left.",
      "About ten minutes ago.",
      "Yes, I did copy it.",
      "He works in accounting.",
    ],
    c: 0,
  },
  {
    q: "When does the staff meeting start?",
    opts: [
      "In the main conference room.",
      "At 2 o'clock this afternoon.",
      "Because the manager requested it.",
      "With the entire department.",
    ],
    c: 1,
  },
  {
    q: "Who is in charge of the new project?",
    opts: [
      "It started last Monday.",
      "The project is very important.",
      "Ms. Park from the marketing team.",
      "Yes, we finished it.",
    ],
    c: 2,
  },
  {
    q: "Have you reviewed the quarterly report?",
    opts: [
      "I'll look it over this afternoon.",
      "The report is on the desk.",
      "Yes, it was quarterly.",
      "The numbers look great.",
    ],
    c: 0,
  },
  {
    q: "How many people attended the seminar?",
    opts: [
      "It lasted about two hours.",
      "Approximately 50 participants.",
      "The seminar was interesting.",
      "Next Tuesday.",
    ],
    c: 1,
  },
  {
    q: "Why was the flight delayed?",
    opts: [
      "To Chicago O'Hare airport.",
      "About three hours.",
      "Due to bad weather conditions.",
      "The flight number is 205.",
    ],
    c: 2,
  },
  {
    q: "Could you send me the contract?",
    opts: [
      "Sure, I'll email it right away.",
      "The contract is signed.",
      "Yes, the client agreed.",
      "I received the contract.",
    ],
    c: 0,
  },
  {
    q: "Where should I submit my expense report?",
    opts: [
      "By the end of the month.",
      "To the finance department.",
      "The expenses were approved.",
      "Yes, it was reimbursed.",
    ],
    c: 1,
  },
  {
    q: "Did the client approve the proposal?",
    opts: [
      "The proposal was excellent.",
      "He was very satisfied.",
      "Yes, they accepted all terms.",
      "We sent it last week.",
    ],
    c: 2,
  },
  {
    q: "When will the new software be installed?",
    opts: [
      "In the IT department.",
      "The technician will handle it.",
      "Sometime next week.",
      "It's a new version.",
    ],
    c: 2,
  },
  {
    q: "Who prepared the presentation slides?",
    opts: [
      "The presentation was great.",
      "It took about two hours.",
      "Jenny from the design team.",
      "We used PowerPoint.",
    ],
    c: 2,
  },
  {
    q: "How do I register for the training session?",
    opts: [
      "The training is mandatory.",
      "You can sign up online.",
      "It starts at 9 AM.",
      "The trainer is experienced.",
    ],
    c: 1,
  },
  {
    q: "Is the warehouse open on weekends?",
    opts: [
      "It opened last year.",
      "The warehouse is large.",
      "No, only on weekdays.",
      "Yes, the doors are open.",
    ],
    c: 2,
  },
  {
    q: "What time does the store close tonight?",
    opts: [
      "We open at 9 in the morning.",
      "At 9 PM.",
      "Because of the holiday sale.",
      "Yes, they close early.",
    ],
    c: 1,
  },
  {
    q: "Should I book a hotel for the conference?",
    opts: [
      "The conference is in Seoul.",
      "Yes, I'd do it soon — rooms fill up fast.",
      "It lasts three days.",
      "The hotel was comfortable.",
    ],
    c: 1,
  },
  {
    q: "Can you recommend a good restaurant nearby?",
    opts: [
      "I usually eat at noon.",
      "The food was delicious.",
      "Try the Italian place on 5th Street.",
      "I prefer home cooking.",
    ],
    c: 2,
  },
  {
    q: "Has the invoice been sent to the client?",
    opts: [
      "Yes, I emailed it this morning.",
      "The invoice amount was high.",
      "The client is in New York.",
      "Payment is due Friday.",
    ],
    c: 0,
  },
  {
    q: "Why is the conference room unavailable?",
    opts: [
      "It holds about 20 people.",
      "There's a board meeting scheduled there.",
      "We can use it tomorrow.",
      "Yes, it's available.",
    ],
    c: 1,
  },
  {
    q: "How long will the renovation take?",
    opts: [
      "They are renovating the lobby.",
      "About three weeks.",
      "The contractor is reliable.",
      "It started on Monday.",
    ],
    c: 1,
  },
  {
    q: "Did you receive my voicemail?",
    opts: [
      "Yes, I'll call you back shortly.",
      "I left a message.",
      "The phone is on the desk.",
      "No, the mail is here.",
    ],
    c: 0,
  },
  {
    q: "Where is the annual general meeting held?",
    opts: [
      "It happens once a year.",
      "All executives must attend.",
      "At the Grand Ballroom downtown.",
      "It lasts about four hours.",
    ],
    c: 2,
  },
  {
    q: "Who signed the new partnership agreement?",
    opts: [
      "The agreement was beneficial.",
      "Both companies agreed.",
      "Our CEO and their director.",
      "It was signed yesterday.",
    ],
    c: 2,
  },
  {
    q: "When is your flight to Tokyo?",
    opts: [
      "I'm flying business class.",
      "Tomorrow evening at 7 PM.",
      "Narita International Airport.",
      "The flight is 12 hours.",
    ],
    c: 1,
  },
  {
    q: "Can you cover for me during the lunch break?",
    opts: [
      "I usually have a salad.",
      "The break is 45 minutes.",
      "Of course, no problem.",
      "Lunch starts at noon.",
    ],
    c: 2,
  },
  {
    q: "What is the deadline for the budget report?",
    opts: [
      "The budget was approved.",
      "Finance handles all reports.",
      "It's due by Friday noon.",
      "We exceeded our target.",
    ],
    c: 2,
  },
];
const PART2 = PART2_DATA.map((d, i) => ({
  id: `p2_${i + 1}`,
  part: 2,
  partLabel: "Part 2: Hỏi và đáp",
  audioText: d.q,
  question: d.q,
  options: d.opts,
  correct: d.c,
  explanation: `"${d.opts[d.c]}" is the most appropriate response.`,
}));

const CONVERSATIONS = [
  {
    script:
      "M: Have you finished the monthly sales report?\nW: Not yet. I need two more hours.\nM: Okay. The manager wants it by 5 PM.",
    qs: [
      {
        q: "What is the man asking about?",
        opts: [
          "A sales report",
          "A project deadline",
          "A meeting schedule",
          "A client visit",
        ],
        c: 0,
      },
      {
        q: "How much more time does the woman need?",
        opts: ["One hour", "Two hours", "Three hours", "Four hours"],
        c: 1,
      },
      {
        q: "When does the manager want the report?",
        opts: ["3 PM", "4 PM", "5 PM", "6 PM"],
        c: 2,
      },
    ],
  },
  {
    script:
      "W: I'd like to order 50 units of product code A-201.\nM: I'm sorry, that item is currently out of stock.\nW: When will it be available again?\nM: Probably in two weeks.",
    qs: [
      {
        q: "What does the woman want to order?",
        opts: [
          "Product A-201",
          "Product B-201",
          "Product C-201",
          "Product D-201",
        ],
        c: 0,
      },
      {
        q: "Why can't the order be fulfilled?",
        opts: [
          "The price changed",
          "The item is out of stock",
          "The warehouse is closed",
          "The order is too large",
        ],
        c: 1,
      },
      {
        q: "When will the product be restocked?",
        opts: ["Next week", "In two weeks", "Next month", "In two months"],
        c: 1,
      },
    ],
  },
  {
    script:
      "M: I'm calling to confirm my reservation for Saturday.\nW: Your name, please?\nM: Johnson. Room 312.\nW: Yes, confirmed. Check-in is at 3 PM.",
    qs: [
      {
        q: "Why is the man calling?",
        opts: [
          "To cancel a reservation",
          "To confirm a reservation",
          "To change a reservation",
          "To make a new reservation",
        ],
        c: 1,
      },
      {
        q: "What is the room number?",
        opts: ["211", "312", "321", "413"],
        c: 1,
      },
      {
        q: "What time is check-in?",
        opts: ["1 PM", "2 PM", "3 PM", "4 PM"],
        c: 2,
      },
    ],
  },
  {
    script:
      "W: Have you seen the new marketing proposal?\nM: Yes, I reviewed it this morning. I think the budget is too high.\nW: The director agrees. We need to cut it by 20%.",
    qs: [
      {
        q: "What are they discussing?",
        opts: [
          "A hiring plan",
          "A marketing proposal",
          "A product launch",
          "A budget meeting",
        ],
        c: 1,
      },
      {
        q: "What does the man think about the budget?",
        opts: [
          "It's too low",
          "It's reasonable",
          "It's too high",
          "It's acceptable",
        ],
        c: 2,
      },
      {
        q: "By how much should the budget be cut?",
        opts: ["10%", "15%", "20%", "25%"],
        c: 2,
      },
    ],
  },
  {
    script:
      "M: The printer on the third floor is broken again.\nW: I'll call the maintenance team right away.\nM: Thanks. I need to print 100 copies before 3 PM.",
    qs: [
      {
        q: "What is the problem?",
        opts: [
          "The copier is broken",
          "The elevator is broken",
          "The printer is broken",
          "The computer is broken",
        ],
        c: 2,
      },
      {
        q: "What will the woman do?",
        opts: [
          "Fix the printer herself",
          "Call maintenance",
          "Buy a new printer",
          "Use another floor's printer",
        ],
        c: 1,
      },
      {
        q: "How many copies does the man need?",
        opts: ["50 copies", "75 copies", "100 copies", "150 copies"],
        c: 2,
      },
    ],
  },
  {
    script:
      "W: Good morning. I have a 10 o'clock appointment with Dr. Lee.\nM: May I have your name?\nW: Sarah Kim.\nM: Please have a seat. The doctor will be with you in about 10 minutes.",
    qs: [
      {
        q: "Where does this conversation take place?",
        opts: [
          "A pharmacy",
          "A hospital reception",
          "A dental clinic",
          "A medical office",
        ],
        c: 1,
      },
      {
        q: "What time is her appointment?",
        opts: ["9 o'clock", "9:30", "10 o'clock", "10:30"],
        c: 2,
      },
      {
        q: "How long does she have to wait?",
        opts: ["5 minutes", "10 minutes", "15 minutes", "20 minutes"],
        c: 1,
      },
    ],
  },
  {
    script:
      "M: We're running low on office supplies. Can you order more?\nW: What exactly do we need?\nM: Printer paper, pens, and some folders.\nW: I'll place the order this afternoon.",
    qs: [
      {
        q: "What is the man asking the woman to do?",
        opts: [
          "Return office supplies",
          "Order office supplies",
          "Check inventory",
          "Deliver packages",
        ],
        c: 1,
      },
      {
        q: "Which of the following is NOT mentioned?",
        opts: ["Printer paper", "Pens", "Folders", "Staples"],
        c: 3,
      },
      {
        q: "When will the woman place the order?",
        opts: [
          "This morning",
          "This afternoon",
          "Tomorrow morning",
          "Next week",
        ],
        c: 1,
      },
    ],
  },
  {
    script:
      "W: Our team just won the client presentation!\nM: That's great news. How did it go?\nW: They loved our new design concept.\nM: Let's celebrate at lunch.",
    qs: [
      {
        q: "What good news does the woman share?",
        opts: [
          "A promotion",
          "Winning a client presentation",
          "A new project",
          "A bonus announcement",
        ],
        c: 1,
      },
      {
        q: "What impressed the client?",
        opts: [
          "The pricing",
          "The timeline",
          "The new design concept",
          "The team members",
        ],
        c: 2,
      },
      {
        q: "What does the man suggest?",
        opts: [
          "Going home early",
          "Celebrating at lunch",
          "Calling the client",
          "Writing a report",
        ],
        c: 1,
      },
    ],
  },
  {
    script:
      "M: I'd like to return this jacket. I bought it last week.\nW: Is there a problem with it?\nM: Yes, the zipper is broken.\nW: Of course. Would you like a refund or an exchange?",
    qs: [
      {
        q: "What does the man want to do?",
        opts: [
          "Buy a jacket",
          "Return a jacket",
          "Get a discount",
          "Check the size",
        ],
        c: 1,
      },
      {
        q: "What is wrong with the jacket?",
        opts: ["Wrong color", "Wrong size", "Broken zipper", "Torn sleeve"],
        c: 2,
      },
      {
        q: "What option does the woman offer?",
        opts: [
          "Repair or replacement",
          "Refund or exchange",
          "Store credit or coupon",
          "Free shipping or discount",
        ],
        c: 1,
      },
    ],
  },
  {
    script:
      "W: I've been offered a job in the Singapore office.\nM: Congratulations! Are you going to accept it?\nW: I'm still thinking. The salary is great but I'd have to relocate.\nM: That's a big decision.",
    qs: [
      {
        q: "What has the woman been offered?",
        opts: [
          "A promotion",
          "A transfer",
          "A new job in Singapore",
          "A business trip",
        ],
        c: 2,
      },
      {
        q: "What is the main concern about the offer?",
        opts: [
          "The salary is low",
          "She would have to relocate",
          "The company is small",
          "The hours are long",
        ],
        c: 1,
      },
      {
        q: "How does the man react?",
        opts: [
          "He is disappointed",
          "He encourages her to decline",
          "He acknowledges it's a big decision",
          "He offers to help her decide",
        ],
        c: 2,
      },
    ],
  },
  {
    script:
      "M: Are you going to the networking event tomorrow?\nW: Yes. I heard there will be over 200 attendees.\nM: I registered but I'm not sure what to expect.\nW: It's a great opportunity to meet potential clients.",
    qs: [
      {
        q: "What are they talking about?",
        opts: [
          "A training seminar",
          "A networking event",
          "A company party",
          "A board meeting",
        ],
        c: 1,
      },
      {
        q: "How many attendees are expected?",
        opts: ["100", "150", "200", "250"],
        c: 2,
      },
      {
        q: "Why does the woman recommend going?",
        opts: [
          "Free food and drinks",
          "To meet potential clients",
          "To learn new skills",
          "To impress the manager",
        ],
        c: 1,
      },
    ],
  },
  {
    script:
      "W: Your package arrived this morning.\nM: Great! Is it the laptop I ordered?\nW: Yes, it is. Should I leave it on your desk?\nM: Please. And let me know if there are any shipping documents.",
    qs: [
      {
        q: "What arrived this morning?",
        opts: ["Documents", "A package", "A visitor", "Supplies"],
        c: 1,
      },
      {
        q: "What was inside the package?",
        opts: ["A printer", "A tablet", "A laptop", "A monitor"],
        c: 2,
      },
      {
        q: "Where should the package be left?",
        opts: ["Reception desk", "Storage room", "His desk", "Meeting room"],
        c: 2,
      },
    ],
  },
  {
    script:
      "M: The IT department is upgrading our computer systems next Monday.\nW: Will we be able to access emails?\nM: No, the email server will be down from 9 to 11 AM.\nW: I'll let the team know.",
    qs: [
      {
        q: "When is the system upgrade scheduled?",
        opts: ["This Friday", "This weekend", "Next Monday", "Next Friday"],
        c: 2,
      },
      {
        q: "What will be unavailable during the upgrade?",
        opts: [
          "The phone system",
          "The email server",
          "The company website",
          "The intranet",
        ],
        c: 1,
      },
      {
        q: "How long will the email be down?",
        opts: ["1 hour", "2 hours", "3 hours", "4 hours"],
        c: 1,
      },
    ],
  },
];
const PART3 = CONVERSATIONS.flatMap((conv, ci) =>
  conv.qs.map((q, qi) => ({
    id: `p3_${ci}_${qi}`,
    part: 3,
    partLabel: "Part 3: Đoạn hội thoại ngắn",
    audioText: conv.script,
    script: conv.script,
    question: q.q,
    options: q.opts,
    correct: q.c,
    explanation: `Correct answer: "${q.opts[q.c]}"`,
  })),
);

const TALKS_DATA = [
  {
    script:
      "Attention all passengers. Flight VN 205 to Ho Chi Minh City is now ready for boarding. Please proceed to Gate 12 with your boarding pass and passport. We remind you that carry-on bags must fit in the overhead compartment. We apologize for the 30-minute delay.",
    qs: [
      {
        q: "What flight is being announced?",
        opts: ["VN 102", "VN 205", "VN 250", "VN 502"],
        c: 1,
      },
      {
        q: "Where should passengers go?",
        opts: ["Gate 10", "Gate 11", "Gate 12", "Gate 13"],
        c: 2,
      },
      {
        q: "How long was the flight delayed?",
        opts: ["15 minutes", "20 minutes", "30 minutes", "45 minutes"],
        c: 2,
      },
    ],
  },
  {
    script:
      "Good morning. This is a reminder that our quarterly performance review meetings will begin this Thursday. All department heads should submit their reports by Wednesday at noon. The reviews will be conducted in alphabetical order by department. HR will contact you with your specific time slot.",
    qs: [
      {
        q: "What type of meeting is mentioned?",
        opts: [
          "Monthly review",
          "Quarterly performance review",
          "Annual shareholder meeting",
          "Weekly team meeting",
        ],
        c: 1,
      },
      {
        q: "By when should reports be submitted?",
        opts: [
          "Tuesday noon",
          "Wednesday noon",
          "Thursday morning",
          "Thursday noon",
        ],
        c: 1,
      },
      {
        q: "Who will contact staff about time slots?",
        opts: [
          "Department heads",
          "The CEO",
          "HR department",
          "The team leader",
        ],
        c: 2,
      },
    ],
  },
  {
    script:
      "Welcome to Tech World Podcast. Today's episode focuses on artificial intelligence in the workplace. We have three expert guests who will share insights on how AI is transforming jobs, improving productivity, and creating new career opportunities. Stay tuned for an exciting discussion.",
    qs: [
      {
        q: "What is the podcast episode about?",
        opts: [
          "Cloud computing",
          "AI in the workplace",
          "Cybersecurity trends",
          "Digital marketing",
        ],
        c: 1,
      },
      {
        q: "How many guests are featured?",
        opts: ["Two", "Three", "Four", "Five"],
        c: 1,
      },
      {
        q: "What will NOT be discussed according to the introduction?",
        opts: [
          "How AI transforms jobs",
          "How AI improves productivity",
          "New career opportunities",
          "AI cost reduction",
        ],
        c: 3,
      },
    ],
  },
  {
    script:
      "Thank you for calling Green Valley Bank. Our branch hours are Monday through Friday, 9 AM to 5 PM, and Saturday, 10 AM to 2 PM. We are closed on Sundays and public holidays. For account balance inquiries, press 1. For loan services, press 2. To speak with a representative, press 0.",
    qs: [
      {
        q: "What are the weekday hours?",
        opts: ["8 AM to 4 PM", "9 AM to 5 PM", "9 AM to 6 PM", "10 AM to 6 PM"],
        c: 1,
      },
      {
        q: "What time does the bank close on Saturday?",
        opts: ["12 PM", "1 PM", "2 PM", "3 PM"],
        c: 2,
      },
      {
        q: "What should you press to speak with a representative?",
        opts: ["1", "2", "3", "0"],
        c: 3,
      },
    ],
  },
  {
    script:
      "This is Dr. Lisa Chen from Sunrise Medical Center reminding you of your appointment on Friday, May 9th at 2:30 PM. Please arrive 15 minutes early to complete paperwork. If you need to reschedule, call us at least 24 hours in advance at 555-2100.",
    qs: [
      {
        q: "When is the appointment?",
        opts: [
          "Thursday May 8",
          "Friday May 9",
          "Saturday May 10",
          "Monday May 12",
        ],
        c: 1,
      },
      {
        q: "What time is the appointment?",
        opts: ["1:30 PM", "2:00 PM", "2:30 PM", "3:00 PM"],
        c: 2,
      },
      {
        q: "How early should the patient arrive?",
        opts: ["5 minutes", "10 minutes", "15 minutes", "20 minutes"],
        c: 2,
      },
    ],
  },
  {
    script:
      "Good afternoon, shoppers. Today only, our electronics department is offering a 30% discount on all laptops and tablets. The sale ends at 8 PM tonight. Additionally, members of our loyalty program will receive an extra 10% off. Visit the electronics section on the second floor.",
    qs: [
      {
        q: "What discount is offered?",
        opts: ["20%", "25%", "30%", "35%"],
        c: 2,
      },
      {
        q: "When does the sale end?",
        opts: ["6 PM", "7 PM", "8 PM", "9 PM"],
        c: 2,
      },
      {
        q: "Where is the electronics section?",
        opts: ["First floor", "Second floor", "Third floor", "Basement"],
        c: 1,
      },
    ],
  },
  {
    script:
      "Welcome to the city bus service. This bus will stop at Central Station, City Hall, Green Park, and the Airport Terminal. Please keep your ticket for inspection. Passengers with large bags are requested to store them under the seat. The next stop is Central Station.",
    qs: [
      {
        q: "Which stop is NOT mentioned?",
        opts: [
          "Central Station",
          "City Hall",
          "Shopping Mall",
          "Airport Terminal",
        ],
        c: 2,
      },
      {
        q: "What should passengers keep for inspection?",
        opts: ["ID card", "Passport", "Their ticket", "Receipt"],
        c: 2,
      },
      {
        q: "What is the next stop?",
        opts: [
          "City Hall",
          "Central Station",
          "Green Park",
          "Airport Terminal",
        ],
        c: 1,
      },
    ],
  },
  {
    script:
      "Hello, I'm calling from the IT helpdesk regarding your software upgrade request. The upgrade has been scheduled for this Saturday from 10 AM to 2 PM. Your computer will restart automatically during this process. Please save all your files before Saturday. If you have questions, call extension 3450.",
    qs: [
      {
        q: "When is the software upgrade?",
        opts: ["Friday", "Saturday", "Sunday", "Monday"],
        c: 1,
      },
      {
        q: "How long will the upgrade take?",
        opts: ["2 hours", "3 hours", "4 hours", "5 hours"],
        c: 2,
      },
      {
        q: "What should users do before Saturday?",
        opts: [
          "Back up passwords",
          "Save all files",
          "Log out of system",
          "Update their email",
        ],
        c: 1,
      },
    ],
  },
  {
    script:
      "Attention team. Our company picnic has been moved from Sunday to next Saturday due to weather forecasts. The venue remains Riverside Park. Lunch will be provided, and there will be team games starting at 1 PM. Please RSVP to events@company.com by Thursday.",
    qs: [
      {
        q: "Why was the picnic rescheduled?",
        opts: [
          "Venue unavailability",
          "Weather forecasts",
          "Budget issues",
          "Staff conflicts",
        ],
        c: 1,
      },
      {
        q: "Where will the picnic be held?",
        opts: [
          "Central Park",
          "Sunset Park",
          "Riverside Park",
          "Greenfield Park",
        ],
        c: 2,
      },
      {
        q: "By when should employees RSVP?",
        opts: ["Monday", "Tuesday", "Wednesday", "Thursday"],
        c: 3,
      },
    ],
  },
  {
    script:
      "This is an important announcement regarding our office relocation. Starting December 1st, our main office will move to 450 Harbor Boulevard, Suite 700. The new office features a larger workspace, updated meeting rooms, and improved parking facilities. Employees will receive a detailed guide about the move next week.",
    qs: [
      {
        q: "When is the office moving?",
        opts: [
          "November 1st",
          "November 15th",
          "December 1st",
          "December 15th",
        ],
        c: 2,
      },
      {
        q: "What is the new address?",
        opts: [
          "450 Harbor Blvd",
          "540 Harbor Blvd",
          "450 Harbor Ave",
          "450 Harbor St",
        ],
        c: 0,
      },
      {
        q: "What will employees receive next week?",
        opts: [
          "A relocation allowance",
          "A detailed guide about the move",
          "New ID cards",
          "Updated contracts",
        ],
        c: 1,
      },
    ],
  },
];
const PART4 = TALKS_DATA.flatMap((talk, ti) =>
  talk.qs.map((q, qi) => ({
    id: `p4_${ti}_${qi}`,
    part: 4,
    partLabel: "Part 4: Bài nói đơn",
    audioText: talk.script,
    script: talk.script,
    question: q.q,
    options: q.opts,
    correct: q.c,
    explanation: `Correct answer: "${q.opts[q.c]}"`,
  })),
);

// Reading Parts
const PART5_DATA = [
  {
    q: "The company ___ a new branch in Singapore last year.",
    opts: ["open", "opens", "opened", "will open"],
    c: 2,
    exp: '"last year" → past tense "opened"',
  },
  {
    q: "Employees are required to submit their reports ___ the end of each month.",
    opts: ["by", "until", "during", "while"],
    c: 0,
    exp: '"by the end" = deadline',
  },
  {
    q: "The CEO gave a ___ speech at the annual conference.",
    opts: ["motivate", "motivation", "motivating", "motivated"],
    c: 2,
    exp: 'Adjective before noun: "motivating speech"',
  },
  {
    q: "The package will be delivered ___ three business days.",
    opts: ["within", "during", "while", "between"],
    c: 0,
    exp: '"within" = before the end of a time period',
  },
  {
    q: "___ the bad weather, the outdoor event was canceled.",
    opts: ["Although", "Because of", "However", "Therefore"],
    c: 1,
    exp: '"Because of" + noun phrase shows cause',
  },
  {
    q: "The new policy will take ___ next Monday.",
    opts: ["effect", "affect", "place", "part"],
    c: 0,
    exp: '"take effect" = start being in force',
  },
  {
    q: "Please ___ your complaint in writing within 30 days.",
    opts: ["submit", "admit", "permit", "commit"],
    c: 0,
    exp: '"submit a complaint" is the correct collocation',
  },
  {
    q: "The meeting has been ___ to next Thursday.",
    opts: ["postponed", "proposed", "promoted", "proceeded"],
    c: 0,
    exp: '"postponed to" = rescheduled for later',
  },
  {
    q: "The project was completed ___ schedule.",
    opts: ["ahead of", "instead of", "due to", "in spite of"],
    c: 0,
    exp: '"ahead of schedule" = finishing early',
  },
  {
    q: "All employees must wear ___ badges while in the building.",
    opts: ["identify", "identified", "identity", "identification"],
    c: 3,
    exp: '"identification badges" is correct',
  },
  {
    q: "The sales figures were ___ than expected this quarter.",
    opts: ["higher", "highly", "high", "heighten"],
    c: 0,
    exp: 'Comparative adjective: "higher than"',
  },
  {
    q: "We are ___ pleased to announce our new product line.",
    opts: ["extreme", "extremeness", "extremely", "extremity"],
    c: 2,
    exp: 'Adverb modifying adjective: "extremely pleased"',
  },
  {
    q: "The board will make a ___ about the merger next week.",
    opts: ["decide", "decisive", "decided", "decision"],
    c: 3,
    exp: 'Noun after article: "a decision"',
  },
  {
    q: "___ customers will receive a loyalty discount.",
    opts: ["Regular", "Regularly", "Regulate", "Regulation"],
    c: 0,
    exp: 'Adjective before noun: "regular customers"',
  },
  {
    q: "The warranty covers ___ defects for two years.",
    opts: ["manufacture", "manufacturing", "manufactured", "manufacturer"],
    c: 1,
    exp: '"manufacturing defects" = defects from production',
  },
  {
    q: "Sales increased ___ after the new campaign launched.",
    opts: ["significant", "significantly", "significance", "signify"],
    c: 1,
    exp: 'Adverb modifying verb: "increased significantly"',
  },
  {
    q: "Please ensure all forms are ___ completed before submission.",
    opts: ["full", "fuller", "fully", "fullness"],
    c: 2,
    exp: 'Adverb: "fully completed"',
  },
  {
    q: "The training session is ___ for all new employees.",
    opts: ["mandate", "mandatory", "mandatorily", "mandated"],
    c: 1,
    exp: 'Adjective: "mandatory for"',
  },
  {
    q: "The new policy will affect ___ member of the team.",
    opts: ["every", "each of", "all", "whole"],
    c: 0,
    exp: '"every" + singular noun',
  },
  {
    q: "Could you provide ___ information about the job opening?",
    opts: ["further", "farther", "furthest", "far"],
    c: 0,
    exp: '"further information" = additional information',
  },
  {
    q: "The renovation is expected to be ___ by end of this month.",
    opts: ["completion", "complete", "completed", "completing"],
    c: 2,
    exp: 'Passive: "to be completed"',
  },
  {
    q: "The manager ___ the budget report before it was submitted.",
    opts: ["approved", "improving", "approving", "approve"],
    c: 0,
    exp: 'Past tense: "approved"',
  },
  {
    q: "We need someone who is ___ with financial software.",
    opts: ["familiar", "familiarly", "familiarity", "familiarize"],
    c: 0,
    exp: '"familiar with" = knows/understands',
  },
  {
    q: "The shipment was ___ due to a customs delay.",
    opts: ["hold", "held", "holding", "holds"],
    c: 1,
    exp: 'Passive past: "was held"',
  },
  {
    q: "Our customer service team is ___ 24 hours a day.",
    opts: ["available", "availability", "availably", "avail"],
    c: 0,
    exp: 'Adjective: "available 24 hours"',
  },
  {
    q: "The contract was signed ___ both parties.",
    opts: ["from", "by", "with", "at"],
    c: 1,
    exp: 'Passive agent: "signed by"',
  },
  {
    q: "Employees are encouraged to ___ new ideas during meetings.",
    opts: ["share", "sharing", "shared", "shareable"],
    c: 0,
    exp: '"encouraged to + base verb: share"',
  },
  {
    q: "The store will be closed ___ renovation.",
    opts: ["while", "during", "for", "because"],
    c: 1,
    exp: '"during renovation" = while renovation happens',
  },
  {
    q: "The report ___ by the team by noon.",
    opts: ["will submitted", "will be submitted", "submits", "submitted"],
    c: 1,
    exp: 'Future passive: "will be submitted"',
  },
  {
    q: "We were impressed ___ the quality of your presentation.",
    opts: ["at", "by", "from", "for"],
    c: 1,
    exp: '"impressed by" is the correct preposition',
  },
];
const PART5 = PART5_DATA.map((d, i) => ({
  id: `p5_${i + 1}`,
  part: 5,
  partLabel: "Part 5: Hoàn thành câu",
  question: d.q,
  options: d.opts,
  correct: d.c,
  explanation: d.exp,
}));

const PART6_PASSAGES = [
  {
    title: "Email: Project Update",
    blanks: [
      {
        opts: ["proceeding with", "proceeded", "proceed", "proceeds"],
        c: 0,
        exp: '"proceeding with" = currently working on',
      },
      {
        opts: ["by", "during", "while", "for"],
        c: 0,
        exp: '"by the end" = deadline',
      },
      {
        opts: ["ahead of", "along with", "in addition to", "despite"],
        c: 0,
        exp: '"ahead of" schedule',
      },
      {
        opts: ["regarding", "whenever", "therefore", "although"],
        c: 0,
        exp: '"regarding" = about',
      },
    ],
  },
  {
    title: "Notice: Office Policy Change",
    blanks: [
      {
        opts: ["inform", "informing", "informed", "information"],
        c: 0,
        exp: '"to inform" = verb after "would like to"',
      },
      {
        opts: ["Eligible", "Eligibility", "Eligibly", "Ineligible"],
        c: 0,
        exp: '"Eligible" = qualifying employees',
      },
      {
        opts: ["with", "against", "without", "despite"],
        c: 2,
        exp: '"without prior approval" from manager',
      },
      {
        opts: ["intending", "intended", "intend", "intention"],
        c: 1,
        exp: '"intended to" = designed/meant to',
      },
    ],
  },
  {
    title: "Advertisement: Job Opening",
    blanks: [
      {
        opts: ["seeking", "sought", "seeks", "to seek"],
        c: 0,
        exp: '"is seeking" = present continuous',
      },
      { opts: ["in", "on", "at", "of"], c: 0, exp: '"experience in" + field' },
      {
        opts: ["preferred", "preferring", "prefer", "preference"],
        c: 0,
        exp: '"is preferred" = considered an advantage',
      },
      {
        opts: ["Congratulations", "Therefore", "Furthermore", "However"],
        c: 2,
        exp: '"Furthermore" adds information',
      },
    ],
  },
  {
    title: "Letter: Customer Complaint Response",
    blanks: [
      {
        opts: ["contacting", "contacted", "contact", "contacts"],
        c: 0,
        exp: '"for contacting" = gerund after preposition',
      },
      {
        opts: [
          "inconvenience",
          "inconveniently",
          "inconvenient",
          "inconveniences",
        ],
        c: 0,
        exp: '"the inconvenience" = noun',
      },
      {
        opts: ["arranged", "arranging", "arrangement", "arrange"],
        c: 0,
        exp: '"have arranged" = present perfect',
      },
      {
        opts: ["Sincerely", "However", "In addition", "Nevertheless"],
        c: 0,
        exp: '"Sincerely" = letter closing',
      },
    ],
  },
];
const PART6 = PART6_PASSAGES.flatMap((p, pi) =>
  p.blanks.map((b, bi) => ({
    id: `p6_${pi}_${bi}`,
    part: 6,
    partLabel: "Part 6: Điền vào đoạn văn",
    passageTitle: p.title,
    question: `"${p.title}" — Blank ${bi + 1}`,
    options: b.opts,
    correct: b.c,
    explanation: b.exp,
  })),
);

const PART7_PASSAGES = [
  {
    title: "Memo: Staff Meeting",
    text: "TO: All Staff\nFROM: HR Department\nDATE: May 5\nSUBJECT: Quarterly Staff Meeting\n\nThis is to inform all employees that our quarterly staff meeting will be held on Friday, May 16th at 2:00 PM in the Main Conference Room. All staff members are required to attend. Managers should prepare a brief update on their department's progress. Light refreshments will be served. Please contact HR if you are unable to attend.",
    qs: [
      {
        q: "What is the purpose of this memo?",
        opts: [
          "To announce a company picnic",
          "To inform staff of a quarterly meeting",
          "To request project reports",
          "To introduce new policies",
        ],
        c: 1,
      },
      {
        q: "When is the meeting?",
        opts: ["May 5th", "May 12th", "May 16th", "May 20th"],
        c: 2,
      },
      {
        q: "What should managers prepare?",
        opts: [
          "Financial forecasts",
          "A brief department update",
          "New employee files",
          "Budget requests",
        ],
        c: 1,
      },
      {
        q: "What will be provided?",
        opts: [
          "Lunch",
          "Light refreshments",
          "Gift vouchers",
          "Meeting materials",
        ],
        c: 1,
      },
      {
        q: "Who sent this memo?",
        opts: ["The CEO", "IT Department", "HR Department", "The manager"],
        c: 2,
      },
      {
        q: "What should you do if you can't attend?",
        opts: [
          "Email your manager",
          "Contact HR",
          "Submit a written report",
          "Attend another session",
        ],
        c: 1,
      },
    ],
  },
  {
    title: "Article: Remote Work Trends",
    text: "A recent survey by WorkTrend Institute found that 68% of employees prefer a hybrid work model. Companies that adopted flexible schedules reported a 23% increase in employee satisfaction and a 15% reduction in turnover rates. However, challenges remain, including maintaining team collaboration and communication across different time zones. Technology tools like video conferencing and project management software have become essential.",
    qs: [
      {
        q: "What percentage prefer hybrid work?",
        opts: ["58%", "63%", "68%", "73%"],
        c: 2,
      },
      {
        q: "What increased by 23%?",
        opts: [
          "Productivity",
          "Employee satisfaction",
          "Revenue",
          "Working hours",
        ],
        c: 1,
      },
      {
        q: "By how much did turnover rates reduce?",
        opts: ["10%", "12%", "15%", "18%"],
        c: 2,
      },
      {
        q: "What is a challenge for remote work?",
        opts: [
          "Higher costs",
          "Team collaboration",
          "Office space",
          "Internet access",
        ],
        c: 1,
      },
      {
        q: "Which tool is mentioned as essential?",
        opts: [
          "Email software",
          "Video conferencing",
          "Printing systems",
          "Phone systems",
        ],
        c: 1,
      },
      {
        q: "Who conducted the survey?",
        opts: [
          "Remote Work Institute",
          "WorkTrend Institute",
          "Business Weekly",
          "HR Analytics Group",
        ],
        c: 1,
      },
    ],
  },
  {
    title: "Advertisement: Language Course",
    text: "ENGLISH FOR BUSINESS — Professional Language Training\n\nAre you looking to advance your career? Our 12-week Business English course is designed for working professionals. Classes are held twice a week, evenings only (7–9 PM). Course fee: $450, including all materials. Early bird discount: Register by June 1st and save 20%. Maximum class size: 15 students. Call 800-5500 or visit www.proenglish.com.",
    qs: [
      {
        q: "How long is the course?",
        opts: ["8 weeks", "10 weeks", "12 weeks", "16 weeks"],
        c: 2,
      },
      {
        q: "When are classes held?",
        opts: ["Mornings", "Afternoons", "Evenings", "Weekends only"],
        c: 2,
      },
      {
        q: "What is the course fee?",
        opts: ["$350", "$400", "$450", "$500"],
        c: 2,
      },
      {
        q: "What discount is available?",
        opts: ["10% off", "15% off", "20% off", "25% off"],
        c: 2,
      },
      {
        q: "What is the maximum class size?",
        opts: ["10 students", "12 students", "15 students", "20 students"],
        c: 2,
      },
      {
        q: "By when must you register for the discount?",
        opts: ["May 1st", "May 15th", "June 1st", "June 15th"],
        c: 2,
      },
    ],
  },
  {
    title: "Email: Shipment Update",
    text: "Subject: Order #45821 — Shipping Update\n\nDear Customer,\n\nWe are pleased to inform you that your order #45821 has been shipped. Your package is expected to arrive within 3–5 business days. You can track your order at www.shopfast.com/tracking using your order number. Please note that delivery times may vary due to local conditions. Contact our support team at support@shopfast.com or call 1-800-SHOPFAST.\n\nThank you for shopping with us!",
    qs: [
      {
        q: "What is the order number?",
        opts: ["42581", "45281", "45821", "48521"],
        c: 2,
      },
      {
        q: "How long will delivery take?",
        opts: ["1–2 days", "2–3 days", "3–5 days", "5–7 days"],
        c: 2,
      },
      {
        q: "How can the customer track the order?",
        opts: [
          "By calling customer service",
          "Using a tracking website",
          "Visiting the store",
          "Checking their email",
        ],
        c: 1,
      },
      {
        q: "What is needed to track the order?",
        opts: [
          "Customer name",
          "Order number",
          "Email address",
          "Phone number",
        ],
        c: 1,
      },
      {
        q: "What may affect delivery time?",
        opts: ["Weather", "Local conditions", "Payment method", "Package size"],
        c: 1,
      },
      {
        q: "How can customers contact support?",
        opts: [
          "Live chat only",
          "Email or phone",
          "In-store only",
          "Social media",
        ],
        c: 1,
      },
    ],
  },
  {
    title: "Notice: Building Maintenance",
    text: "BUILDING MAINTENANCE NOTICE\n\nDear Tenants,\n\nScheduled maintenance work on the elevators in Building A will take place on Saturday, April 19th, from 8 AM to 4 PM. During this time, the elevators will be out of service. We recommend using the stairwells, which will remain accessible. For tenants on upper floors who require special assistance, please contact the building management office at ext. 210 by Friday, April 18th.",
    qs: [
      {
        q: "What is being maintained?",
        opts: [
          "The parking lot",
          "The elevators",
          "The fire system",
          "The air conditioning",
        ],
        c: 1,
      },
      {
        q: "When will the maintenance occur?",
        opts: [
          "Friday April 18",
          "Saturday April 19",
          "Sunday April 20",
          "Monday April 21",
        ],
        c: 1,
      },
      {
        q: "What hours will elevators be down?",
        opts: ["6 AM–2 PM", "7 AM–3 PM", "8 AM–4 PM", "9 AM–5 PM"],
        c: 2,
      },
      {
        q: "What will be available?",
        opts: [
          "Service elevators",
          "Stairwells",
          "Freight lifts",
          "Side entrances",
        ],
        c: 1,
      },
      {
        q: "Who needs special assistance?",
        opts: [
          "All tenants",
          "Tenants on upper floors",
          "Office staff",
          "Visitors",
        ],
        c: 1,
      },
      {
        q: "By when should tenants contact management?",
        opts: [
          "By Thursday",
          "By Friday April 18",
          "By Saturday morning",
          "By Sunday",
        ],
        c: 1,
      },
    ],
  },
  {
    title: "Report: Sales Performance",
    text: "Q1 Sales Performance Report\n\nTotal revenue for Q1 reached $4.2 million, representing a 12% increase compared to the same period last year. The electronics division performed strongest, contributing 38% of total sales. The furniture division saw a 5% decline due to supply chain issues. Customer retention rate improved to 78%, up from 71% last year. The company onboarded 340 new customers during the quarter.",
    qs: [
      {
        q: "What was Q1 revenue?",
        opts: ["$3.8 million", "$4.0 million", "$4.2 million", "$4.5 million"],
        c: 2,
      },
      {
        q: "By how much did revenue increase?",
        opts: ["8%", "10%", "12%", "15%"],
        c: 2,
      },
      {
        q: "Which division performed best?",
        opts: ["Furniture", "Electronics", "Appliances", "Software"],
        c: 1,
      },
      {
        q: "Why did furniture sales decline?",
        opts: [
          "Low demand",
          "Price competition",
          "Supply chain issues",
          "Staff shortage",
        ],
        c: 2,
      },
      {
        q: "What was the retention rate?",
        opts: ["71%", "75%", "78%", "82%"],
        c: 2,
      },
      {
        q: "How many new customers were onboarded?",
        opts: ["240", "280", "320", "340"],
        c: 3,
      },
    ],
  },
  {
    title: "Policy: Travel Expense",
    text: "COMPANY TRAVEL EXPENSE POLICY\n\nAll business travel must be pre-approved by a direct manager at least 48 hours in advance. Economy class flights are standard for domestic travel. Business class may be approved for international flights exceeding 8 hours. Daily meal allowance is $60 domestic and $100 international. Hotel accommodation must not exceed $150 per night for domestic trips. All receipts must be submitted within 10 business days of returning.",
    qs: [
      {
        q: "How far in advance must travel be approved?",
        opts: ["24 hours", "36 hours", "48 hours", "72 hours"],
        c: 2,
      },
      {
        q: "What class is standard for domestic flights?",
        opts: [
          "First class",
          "Business class",
          "Economy class",
          "Premium economy",
        ],
        c: 2,
      },
      {
        q: "When is business class allowed?",
        opts: [
          "All international flights",
          "Flights over 6 hours",
          "International flights over 8 hours",
          "Any flight over 4 hours",
        ],
        c: 2,
      },
      {
        q: "What is the domestic daily meal allowance?",
        opts: ["$50", "$60", "$80", "$100"],
        c: 1,
      },
      {
        q: "What is the hotel limit for domestic trips?",
        opts: ["$100", "$120", "$150", "$200"],
        c: 2,
      },
      {
        q: "When must receipts be submitted?",
        opts: [
          "Within 5 days",
          "Within 7 days",
          "Within 10 days",
          "Within 14 days",
        ],
        c: 2,
      },
    ],
  },
  {
    title: "Article: Customer Service",
    text: "Leading companies demonstrate that exceptional customer service drives long-term growth. Studies show that customers who receive excellent service are 3 times more likely to make repeat purchases. Furthermore, satisfied customers refer an average of 3 new clients through word-of-mouth. On the other hand, a negative experience can lead a customer to share dissatisfaction with up to 15 people. Investing in training has been shown to increase customer satisfaction scores by up to 35%.",
    qs: [
      {
        q: "How much more likely are satisfied customers to repurchase?",
        opts: ["2 times", "3 times", "4 times", "5 times"],
        c: 1,
      },
      {
        q: "How many new clients does a satisfied customer refer?",
        opts: ["2", "3", "4", "5"],
        c: 1,
      },
      {
        q: "How many people hear about a negative experience?",
        opts: ["Up to 10", "Up to 15", "Up to 20", "Up to 25"],
        c: 1,
      },
      {
        q: "By how much can training increase satisfaction?",
        opts: ["Up to 20%", "Up to 25%", "Up to 30%", "Up to 35%"],
        c: 3,
      },
      {
        q: "What drives long-term growth?",
        opts: [
          "Product quality",
          "Competitive pricing",
          "Customer service",
          "Marketing campaigns",
        ],
        c: 2,
      },
      {
        q: "How do satisfied customers refer new clients?",
        opts: ["Social media", "Advertising", "Word-of-mouth", "Direct emails"],
        c: 2,
      },
    ],
  },
  {
    title: "Job Posting: Marketing Manager",
    text: "JOB POSTING: SENIOR MARKETING MANAGER\nDepartment: Marketing | Location: Ho Chi Minh City | Salary: $2,500–$3,500/month\n\nResponsibilities: Develop and execute marketing strategies, manage a team of 5–8 specialists, oversee digital campaigns, and prepare monthly performance reports.\n\nRequirements: Bachelor's degree in Marketing or related field, minimum 5 years experience, proficient in Google Analytics and CRM tools, strong leadership skills.\n\nBenefits: Health insurance, 14 days annual leave, performance bonuses. Apply by May 30th.",
    qs: [
      {
        q: "Where is the position based?",
        opts: ["Hanoi", "Da Nang", "Ho Chi Minh City", "Singapore"],
        c: 2,
      },
      {
        q: "What is the team size managed?",
        opts: ["3–5", "5–8", "8–10", "10–15"],
        c: 1,
      },
      {
        q: "What is the minimum experience required?",
        opts: ["3 years", "4 years", "5 years", "6 years"],
        c: 2,
      },
      {
        q: "Which tool must candidates know?",
        opts: ["Salesforce", "Google Analytics", "Photoshop", "SAP"],
        c: 1,
      },
      {
        q: "How many annual leave days?",
        opts: ["10", "12", "14", "15"],
        c: 2,
      },
      {
        q: "What is the application deadline?",
        opts: ["May 15th", "May 20th", "May 25th", "May 30th"],
        c: 3,
      },
    ],
  },
];
const PART7 = PART7_PASSAGES.flatMap((p, pi) =>
  p.qs.map((q, qi) => ({
    id: `p7_${pi}_${qi}`,
    part: 7,
    partLabel: "Part 7: Đọc hiểu",
    passageTitle: p.title,
    passageText: p.text,
    question: q.q,
    options: q.opts,
    correct: q.c,
    explanation: `Correct answer: "${q.opts[q.c]}"`,
  })),
);

const LISTENING_QUESTIONS = [...PART1, ...PART2, ...PART3, ...PART4];
const READING_QUESTIONS = [...PART5, ...PART6, ...PART7];

const TESTS = [
  {
    id: 1,
    name: "TOEIC Test 1",
    desc: "Bài thi thương mại & văn phòng",
    available: true,
    color: "from-pink-500 to-rose-600",
    emoji: "🏆",
    date: "Tháng 5/2026",
  },
  {
    id: 2,
    name: "TOEIC Test 2",
    desc: "Bài thi du lịch & dịch vụ",
    available: false,
    color: "from-violet-500 to-indigo-600",
    emoji: "✈️",
    date: "Sắp ra mắt",
  },
  {
    id: 3,
    name: "TOEIC Test 3",
    desc: "Bài thi công nghệ & IT",
    available: false,
    color: "from-blue-500 to-cyan-600",
    emoji: "💻",
    date: "Sắp ra mắt",
  },
  {
    id: 4,
    name: "TOEIC Test 4",
    desc: "Bài thi y tế & sức khỏe",
    available: false,
    color: "from-green-500 to-teal-600",
    emoji: "🏥",
    date: "Sắp ra mắt",
  },
  {
    id: 5,
    name: "TOEIC Test 5",
    desc: "Bài thi giáo dục & học thuật",
    available: false,
    color: "from-orange-500 to-amber-600",
    emoji: "🎓",
    date: "Sắp ra mắt",
  },
];

const PART_COLORS = {
  1: "from-green-500 to-teal-600",
  2: "from-blue-500 to-cyan-600",
  3: "from-violet-500 to-indigo-600",
  4: "from-orange-500 to-amber-600",
  5: "from-pink-500 to-rose-600",
  6: "from-teal-500 to-cyan-600",
  7: "from-purple-500 to-indigo-700",
};

function formatTime(s) {
  const m = Math.floor(s / 60);
  return `${String(m).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
}

export default function Toeic() {
  const [phase, setPhase] = useState("list"); // list | intro | listening | reading | result
  const [selectedTest, setSelectedTest] = useState(null);
  const [answers, setAnswers] = useState({});
  const [index, setIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(45 * 60);
  const timerRef = useRef(null);

  const selectTest = (test) => {
    if (!test.available) return;
    setSelectedTest(test);
    setPhase("intro");
  };

  const startListening = () => {
    setPhase("listening");
    setIndex(0);
    setTimeLeft(45 * 60);
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(timerRef.current);
          transitionToReading();
          return 0;
        }
        return t - 1;
      });
    }, 1000);
  };

  const transitionToReading = () => {
    clearInterval(timerRef.current);
    setPhase("reading");
    setIndex(0);
    setTimeLeft(75 * 60);
    timerRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          clearInterval(timerRef.current);
          setPhase("result");
          return 0;
        }
        return t - 1;
      });
    }, 1000);
  };

  const submitListening = () => transitionToReading();
  const submitReading = () => {
    clearInterval(timerRef.current);
    setPhase("result");
  };

  const handleAnswer = (choice) =>
    setAnswers((prev) => ({ ...prev, [`${phase}_${index}`]: choice }));

  const goNext = () => {
    const questions =
      phase === "listening" ? LISTENING_QUESTIONS : READING_QUESTIONS;
    if (index < questions.length - 1) setIndex(index + 1);
    else if (phase === "listening") submitListening();
    else submitReading();
  };
  const goPrev = () => {
    if (index > 0) setIndex(index - 1);
  };

  const reset = () => {
    clearInterval(timerRef.current);
    setPhase("list");
    setSelectedTest(null);
    setAnswers({});
    setIndex(0);
    setTimeLeft(45 * 60);
  };

  const calcScore = (questions, phaseKey) =>
    questions.filter((q, i) => answers[`${phaseKey}_${i}`] === q.correct)
      .length;

  if (phase === "list") return <TestList tests={TESTS} onSelect={selectTest} />;
  if (phase === "intro")
    return (
      <IntroScreen
        test={selectedTest}
        onStart={startListening}
        onBack={() => setPhase("list")}
      />
    );
  if (phase === "result")
    return (
      <ResultScreen
        listeningScore={calcScore(LISTENING_QUESTIONS, "listening")}
        readingScore={calcScore(READING_QUESTIONS, "reading")}
        listeningQuestions={LISTENING_QUESTIONS}
        readingQuestions={READING_QUESTIONS}
        answers={answers}
        onReset={reset}
      />
    );

  const questions =
    phase === "listening" ? LISTENING_QUESTIONS : READING_QUESTIONS;
  const q = questions[index];
  const answered = answers[`${phase}_${index}`];
  const timeWarning = timeLeft < 300;
  const isListening = phase === "listening";

  return (
    <div className="min-h-screen bg-background p-4 lg:p-6 flex flex-col max-h-screen overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between mb-3 flex-shrink-0">
        <button
          onClick={reset}
          className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground font-semibold text-sm px-3 py-1.5 rounded-xl hover:bg-muted"
        >
          <ArrowLeft className="w-4 h-4" /> Thoát
        </button>
        <div
          className={`flex items-center gap-2 px-4 py-2 rounded-xl border-2 font-black text-sm ${timeWarning ? "bg-red-50 border-red-400 text-red-600 animate-pulse" : "bg-white border-border"}`}
        >
          <Clock className="w-4 h-4" /> {formatTime(timeLeft)}
        </div>
        <div className="flex items-center gap-2">
          <span
            className={`text-xs font-bold px-2.5 py-1 rounded-lg ${isListening ? "bg-green-100 text-green-700" : "bg-blue-100 text-blue-700"}`}
          >
            {isListening ? "🎧 Nghe" : "📖 Đọc"}
          </span>
          <span className="text-sm font-bold text-muted-foreground bg-muted px-2.5 py-1 rounded-lg">
            {index + 1}/{questions.length}
          </span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="w-full h-1.5 bg-muted rounded-full mb-3 flex-shrink-0">
        <div
          className={`h-full rounded-full transition-all bg-gradient-to-r ${PART_COLORS[q.part]}`}
          style={{ width: `${((index + 1) / questions.length) * 100}%` }}
        />
      </div>

      {/* Part label */}
      <div
        className={`inline-flex self-start items-center px-3 py-1 rounded-lg text-white text-xs font-black mb-3 bg-gradient-to-r ${PART_COLORS[q.part]} flex-shrink-0`}
      >
        {q.partLabel}
      </div>

      {/* Scrollable content area */}
      <div className="flex-1 overflow-y-auto space-y-3 pb-2">
        {/* Image (Part 1) */}
        {q.imageUrl && (
          <div className="rounded-2xl overflow-hidden border border-border shadow-sm">
            <img
              src={q.imageUrl}
              alt="TOEIC Photo"
              className="w-full h-48 object-cover"
            />
          </div>
        )}

        {/* Audio player (Parts 1-4) */}
        {q.audioText && (
          <AudioPlayer text={q.audioText} gradient={PART_COLORS[q.part]} />
        )}

        {/* Script/Passage for Part 7 */}
        {q.passageText && (
          <div className="bg-white rounded-2xl border border-border p-4 shadow-sm">
            <p className="text-xs font-black text-muted-foreground mb-2 uppercase tracking-wide">
              📄 {q.passageTitle}
            </p>
            <p className="text-sm text-foreground whitespace-pre-line font-medium leading-relaxed">
              {q.passageText}
            </p>
          </div>
        )}

        {/* Conversation script (Part 3/4) — collapsible */}
        {q.script && !q.imageUrl && (
          <details className="bg-white rounded-2xl border border-border overflow-hidden">
            <summary className="p-3 font-bold text-sm cursor-pointer hover:bg-muted text-muted-foreground">
              📄 Xem nội dung hội thoại
            </summary>
            <div className="p-4 pt-0">
              <p className="text-sm text-muted-foreground whitespace-pre-line font-medium">
                {q.script}
              </p>
            </div>
          </details>
        )}

        {/* Question */}
        <div className="bg-white rounded-2xl border border-border p-4 shadow-sm">
          <p className="font-bold text-foreground text-sm leading-relaxed">
            {q.question}
          </p>
        </div>

        {/* Options */}
        <div className="space-y-2">
          {q.options.map((opt, i) => {
            const letter = ["A", "B", "C", "D"][i];
            const isSelected = answered === i;
            return (
              <button
                key={i}
                onClick={() => handleAnswer(i)}
                className={`w-full text-left px-4 py-3 rounded-xl border-2 font-semibold text-sm flex items-center gap-3 transition-all ${
                  isSelected
                    ? `bg-gradient-to-r ${PART_COLORS[q.part]} text-white border-transparent shadow-md`
                    : "bg-white border-border hover:border-primary/40 hover:shadow-sm"
                }`}
              >
                <span
                  className={`w-7 h-7 rounded-lg flex items-center justify-center font-black text-xs flex-shrink-0 ${isSelected ? "bg-white/25 text-white" : "bg-muted text-muted-foreground"}`}
                >
                  {letter}
                </span>
                {opt}
              </button>
            );
          })}
        </div>
      </div>

      {/* Navigation buttons - fixed at bottom */}
      <div className="flex gap-3 mt-3 flex-shrink-0">
        <button
          onClick={goPrev}
          disabled={index === 0}
          className="flex items-center gap-2 px-5 py-3 rounded-xl border-2 border-border font-bold text-sm hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed transition-all"
        >
          <ArrowLeft className="w-4 h-4" /> Trước
        </button>
        <button
          onClick={goNext}
          className={`flex-1 py-3 rounded-xl font-bold text-sm text-white shadow-md hover:opacity-90 transition-all flex items-center justify-center gap-2 bg-gradient-to-r ${PART_COLORS[q.part]}`}
        >
          {index === questions.length - 1 ? (
            phase === "listening" ? (
              "🎧 Nộp phần Nghe"
            ) : (
              "✓ Nộp bài thi"
            )
          ) : (
            <>
              Tiếp theo <ChevronRight className="w-4 h-4" />
            </>
          )}
        </button>
      </div>
    </div>
  );
}

function AudioPlayer({ text, gradient }) {
  const [playing, setPlaying] = useState(false);
  const uttRef = useRef(null);

  const play = () => {
    window.speechSynthesis.cancel();
    const utt = new SpeechSynthesisUtterance(text);
    utt.lang = "en-US";
    utt.rate = 0.85;
    utt.onend = () => setPlaying(false);
    utt.onerror = () => setPlaying(false);
    uttRef.current = utt;
    setPlaying(true);
    window.speechSynthesis.speak(utt);
  };

  const stop = () => {
    window.speechSynthesis.cancel();
    setPlaying(false);
  };

  return (
    <div
      className={`bg-gradient-to-r ${gradient} rounded-2xl p-4 text-white shadow-md`}
    >
      <div className="flex items-center gap-4">
        <div className="flex gap-2">
          <button
            onClick={play}
            disabled={playing}
            className="w-11 h-11 bg-white/20 hover:bg-white/30 disabled:opacity-50 rounded-full flex items-center justify-center transition-all"
          >
            <Play className="w-5 h-5" />
          </button>
          {playing && (
            <button
              onClick={stop}
              className="w-11 h-11 bg-red-500/80 hover:bg-red-400 rounded-full flex items-center justify-center transition-all"
            >
              <Square className="w-5 h-5" />
            </button>
          )}
        </div>
        <div>
          <p className="font-bold text-sm">
            {playing ? "Đang phát..." : "Nhấn ▶ để nghe"}
          </p>
          <p className="text-white/70 text-xs">
            {playing ? "Nhấn ■ để dừng" : "Text-to-Speech (EN)"}
          </p>
        </div>
        {playing && <Volume2 className="w-5 h-5 animate-pulse ml-auto" />}
      </div>
    </div>
  );
}

function TestList({ tests, onSelect }) {
  return (
    <div className="min-h-screen bg-background p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-black text-foreground">
          🏆 Luyện thi TOEIC
        </h1>
        <p className="text-muted-foreground text-sm mt-1">
          Chọn bài thi để bắt đầu luyện tập
        </p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl">
        {tests.map((test) => (
          <button
            key={test.id}
            onClick={() => onSelect(test)}
            className={`text-left rounded-2xl p-5 border-2 transition-all ${test.available ? "bg-white border-border hover:border-primary hover:shadow-lg card-hover cursor-pointer" : "bg-muted/30 border-muted cursor-not-allowed opacity-70"}`}
          >
            <div
              className={`w-12 h-12 bg-gradient-to-br ${test.color} rounded-xl flex items-center justify-center text-2xl mb-3 shadow-md`}
            >
              {test.emoji}
            </div>
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-black text-foreground">{test.name}</h3>
                <p className="text-xs text-muted-foreground mt-0.5 font-medium">
                  {test.desc}
                </p>
              </div>
              {!test.available && (
                <Lock className="w-4 h-4 text-muted-foreground flex-shrink-0 mt-0.5" />
              )}
            </div>
            <div className="flex items-center justify-between mt-3">
              <span
                className={`text-xs font-bold px-2 py-0.5 rounded-full ${test.available ? "bg-green-100 text-green-700" : "bg-muted text-muted-foreground"}`}
              >
                {test.available ? "✓ Có sẵn" : "🔒 Sắp ra mắt"}
              </span>
              <span className="text-xs text-muted-foreground">{test.date}</span>
            </div>
            {test.available && (
              <div className="mt-3 flex gap-3 text-xs text-muted-foreground font-medium">
                <span>200 câu</span>
                <span>•</span>
                <span>120 phút</span>
                <span>•</span>
                <span>7 Parts</span>
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

function IntroScreen({ test, onStart, onBack }) {
  return (
    <div className="min-h-screen bg-background p-6 lg:p-8">
      <button
        onClick={onBack}
        className="flex items-center gap-2 text-muted-foreground hover:text-foreground font-semibold text-sm mb-6"
      >
        <ArrowLeft className="w-4 h-4" /> Quay lại
      </button>
      <h1 className="text-2xl font-black text-foreground mb-1">
        {test?.emoji} {test?.name}
      </h1>
      <p className="text-muted-foreground text-sm mb-6">{test?.desc}</p>
      <div className="max-w-2xl">
        <div
          className={`bg-gradient-to-br ${test?.color || "from-pink-500 to-rose-600"} rounded-2xl p-6 text-white mb-6 shadow-lg`}
        >
          <h2 className="text-xl font-black mb-4">Tổng quan bài thi</h2>
          <div className="grid grid-cols-2 gap-3">
            {[
              ["200 câu hỏi", "100 nghe + 100 đọc"],
              ["120 phút", "45' nghe + 75' đọc"],
              ["990 điểm", "Thang điểm chuẩn"],
              ["7 Parts", "Part 1 → Part 7"],
            ].map(([v, l]) => (
              <div key={v} className="bg-white/20 rounded-xl p-3">
                <p className="text-lg font-black">{v}</p>
                <p className="text-white/80 text-xs font-medium">{l}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="bg-white rounded-2xl border border-border p-5">
            <h3 className="font-black text-foreground mb-3">
              🎧 Phần Nghe (45 phút)
            </h3>
            <div className="space-y-2 text-sm text-muted-foreground font-medium">
              {[
                ["Part 1", "Mô tả ảnh", "6"],
                ["Part 2", "Hỏi và đáp", "25"],
                ["Part 3", "Hội thoại", "39"],
                ["Part 4", "Bài nói đơn", "30"],
              ].map(([p, l, n]) => (
                <div key={p} className="flex items-center gap-2">
                  <span className="w-12 text-xs font-bold text-green-600">
                    {p}
                  </span>
                  <span className="flex-1">{l}</span>
                  <span className="font-bold text-foreground">{n} câu</span>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-border p-5">
            <h3 className="font-black text-foreground mb-3">
              📖 Phần Đọc (75 phút)
            </h3>
            <div className="space-y-2 text-sm text-muted-foreground font-medium">
              {[
                ["Part 5", "Hoàn thành câu", "30"],
                ["Part 6", "Điền đoạn văn", "16"],
                ["Part 7", "Đọc hiểu", "54"],
              ].map(([p, l, n]) => (
                <div key={p} className="flex items-center gap-2">
                  <span className="w-12 text-xs font-bold text-blue-600">
                    {p}
                  </span>
                  <span className="flex-1">{l}</span>
                  <span className="font-bold text-foreground">{n} câu</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        <button
          onClick={onStart}
          className="w-full gradient-primary text-white py-4 rounded-2xl font-black text-lg shadow-lg hover:opacity-90 transition-all"
        >
          🎧 Bắt đầu phần Nghe →
        </button>
      </div>
    </div>
  );
}

function ResultScreen({
  listeningScore,
  readingScore,
  listeningQuestions,
  readingQuestions,
  answers,
  onReset,
}) {
  const [showReview, setShowReview] = useState(null);
  const listeningScaled = Math.round((listeningScore / 100) * 495);
  const readingScaled = Math.round((readingScore / 100) * 495);
  const estimated = listeningScaled + readingScaled;
  const pct = Math.round(((listeningScore + readingScore) / 200) * 100);

  const renderReview = (questions, phaseKey) => (
    <div className="space-y-3 mt-4">
      {questions.map((q, i) => {
        const userAns = answers[`${phaseKey}_${i}`];
        const correct = userAns === q.correct;
        return (
          <div
            key={q.id}
            className={`bg-white rounded-xl border p-4 ${correct ? "border-green-200" : "border-red-200"}`}
          >
            <div className="flex items-start gap-3">
              {correct ? (
                <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
              ) : (
                <XCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              )}
              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-muted-foreground mb-1">
                  {q.partLabel} — Câu {i + 1}
                </p>
                <p className="text-sm font-bold text-foreground truncate">
                  {q.question.length > 80
                    ? q.question.substring(0, 80) + "..."
                    : q.question}
                </p>
                {!correct && (
                  <p className="text-xs text-green-700 mt-1">
                    ✓ Đáp án: {q.options[q.correct]}
                  </p>
                )}
                {userAns !== undefined && !correct && (
                  <p className="text-xs text-red-600">
                    ✗ Bạn chọn: {q.options[userAns]}
                  </p>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );

  return (
    <div className="min-h-screen bg-background p-6 lg:p-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white rounded-3xl p-8 shadow-xl border border-border text-center mb-6">
          <div className="text-5xl mb-4">
            {pct >= 80 ? "🏆" : pct >= 60 ? "🎯" : "💪"}
          </div>
          <h2 className="text-2xl font-black mb-4">Kết quả bài thi TOEIC</h2>
          <div className="text-6xl font-black text-primary mb-2">
            {estimated}
          </div>
          <p className="text-muted-foreground font-medium mb-6">
            Điểm TOEIC ước tính / 990
          </p>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-green-50 rounded-2xl p-4 border border-green-200">
              <p className="text-sm font-semibold text-green-700">
                🎧 Phần Nghe
              </p>
              <p className="text-2xl font-black text-green-600">
                {listeningScaled}
              </p>
              <p className="text-xs text-green-600">
                {listeningScore}/100 câu đúng
              </p>
            </div>
            <div className="bg-blue-50 rounded-2xl p-4 border border-blue-200">
              <p className="text-sm font-semibold text-blue-700">📖 Phần Đọc</p>
              <p className="text-2xl font-black text-blue-600">
                {readingScaled}
              </p>
              <p className="text-xs text-blue-600">
                {readingScore}/100 câu đúng
              </p>
            </div>
          </div>
        </div>
        <div className="flex gap-3 mb-4">
          <button
            onClick={() =>
              setShowReview(showReview === "listening" ? null : "listening")
            }
            className="flex-1 py-3 rounded-xl border border-green-300 bg-green-50 text-green-700 font-bold text-sm hover:bg-green-100"
          >
            🎧 Xem lại Nghe
          </button>
          <button
            onClick={() =>
              setShowReview(showReview === "reading" ? null : "reading")
            }
            className="flex-1 py-3 rounded-xl border border-blue-300 bg-blue-50 text-blue-700 font-bold text-sm hover:bg-blue-100"
          >
            📖 Xem lại Đọc
          </button>
        </div>
        {showReview === "listening" &&
          renderReview(listeningQuestions, "listening")}
        {showReview === "reading" && renderReview(readingQuestions, "reading")}
        <button
          onClick={onReset}
          className="w-full mt-4 gradient-primary text-white py-3 rounded-xl font-bold shadow-md hover:opacity-90 flex items-center justify-center gap-2"
        >
          <RotateCcw className="w-4 h-4" /> Chọn bài thi khác
        </button>
      </div>
    </div>
  );
}
