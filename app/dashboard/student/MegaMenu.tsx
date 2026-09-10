'use client'

import { useState } from 'react'
import Link from 'next/link'

const MENU_DATA = {
  Academics: [
    {
      title: "Cohorts",
      links: [
        { label: "Career Profiling", href: "#" },
        { label: "My Cohorts Progress", href: "#" },
        { label: "My Cohorts Status", href: "#" },
        { label: "Select Cohort", href: "#" }
      ]
    },
    {
      title: "Examination System",
      links: [
        { label: "Academic Result", href: "/dashboard/student/results" },
        { label: "Application for Academic Certificate", href: "/dashboard/student/certificates" },
        { label: "Application for Degree Extension", href: "#" },
        { label: "Application for Refund", href: "#" },
        { label: "Examination Attendance", href: "#" },
        { label: "Examination Date Sheet", href: "#" },
        { label: "Faculty Feedback", href: "#" }
      ]
    },
    {
      title: "Learning Management System (LMS)",
      links: [
        { label: "Assignment Download", href: "/dashboard/student/assignments" },
        { label: "Assignment Upload", href: "/dashboard/student/assignments" },
        { label: "CR Nomination", href: "#" },
        { label: "View Academic Course Syllabus", href: "#" },
        { label: "View Attendance", href: "/dashboard/student/attendance" },
        { label: "View Instruction Plans", href: "#" },
        { label: "View Time Table", href: "/dashboard/student/timetable" }
      ]
    },
    {
      title: "Library Management System",
      links: [
        { label: "Discussion Room Booking", href: "#" },
        { label: "Dissertation/Thesis", href: "#" },
        { label: "E-Resources", href: "#" },
        { label: "Library Search", href: "/dashboard/student/library" }
      ]
    },
    {
      title: "Placement Services",
      links: [
        { label: "Career Services Registration", href: "#" },
        { label: "Internship Recommendation Letter", href: "#" },
        { label: "Placement Document Repository", href: "#" },
        { label: "Placement Portal", href: "/dashboard/student/placements" }
      ]
    },
    {
      title: "Project / Dissertation",
      links: [
        { label: "CDP Certificate Download", href: "#" },
        { label: "Project / Dissertation Attendance View", href: "#" },
        { label: "Project / Dissertation Marks View", href: "#" }
      ]
    },
    {
      title: "Skill Development Courses",
      links: [
        { label: "CPE Certificate Details", href: "#" },
        { label: "Skill Development Courses", href: "#" },
        { label: "Skill Development Program", href: "#" }
      ]
    }
  ],
  Administrative: [
    {
      title: "Alumni Services",
      links: [
        { label: "Alumni Membership Fee", href: "#" },
        { label: "Alumni Mentor Selection", href: "#" },
        { label: "Update Alumni Profile", href: "#" }
      ]
    },
    {
      title: "Fee and Scholarship System",
      links: [
        { label: "Fee Dashboard", href: "/dashboard/student/fees" },
        { label: "Apply and Download Fee related Certificates", href: "#" },
        { label: "Scholarship Letter", href: "#" },
        { label: "View Fee Receipts", href: "#" },
        { label: "View Fee Status", href: "/dashboard/student/fees" }
      ]
    },
    {
      title: "My Profile",
      links: [
        { label: "My Virtual ID Card", href: "#" },
        { label: "Profile Update", href: "#" }
      ]
    },
    {
      title: "Residential Services",
      links: [
        { label: "Electricity Consumption View", href: "#" },
        { label: "Hostel Booking", href: "/dashboard/student/hostel" },
        { label: "Hostel Leave Application", href: "#" },
        { label: "Hostel Guidelines", href: "#" }
      ]
    },
    {
      title: "Security and Safety",
      links: [
        { label: "Case Details", href: "#" },
        { label: "RFID Application Form", href: "#" }
      ]
    }
  ],
  Important_Links: [
    {
      title: "Capstone Dissertation Internships",
      links: [
        { label: "External CA format for Internship", href: "#" },
        { label: "Guidelines - Inviting External Examiners", href: "#" }
      ]
    },
    {
      title: "Change Password",
      links: [
        { label: "Change UMS Password", href: "#" },
        { label: "Reset Internet Password", href: "#" }
      ]
    },
    {
      title: "Miscellaneous Links",
      links: [
        { label: "Emergency Contact Numbers", href: "#" },
        { label: "View Academic Calendar", href: "#" }
      ]
    },
    {
      title: "Policies, Rules, Guidelines",
      links: [
        { label: "Academic Honour To Regular Students", href: "#" },
        { label: "Attendance Marking Policy", href: "#" },
        { label: "Dress Code and Uniform Policy", href: "#" }
      ]
    }
  ],
  Student_Services: [
    {
      title: "Feedback and Surveys",
      links: [
        { label: "Feedback for Program Scheme and Courses", href: "#" },
        { label: "Grievances Description", href: "#" },
        { label: "Online Survey", href: "#" }
      ]
    },
    {
      title: "Health Services",
      links: [
        { label: "Counseling Psychologist Appointment", href: "#" },
        { label: "Doctor Appointment", href: "#" }
      ]
    },
    {
      title: "Relationship Management System (RMS)",
      links: [
        { label: "Log Request", href: "#" },
        { label: "View Request Status", href: "#" }
      ]
    },
    {
      title: "Student Welfare",
      links: [
        { label: "Event Registration", href: "#" },
        { label: "Student Organization Registration", href: "#" }
      ]
    }
  ]
}

export function MegaMenu() {
  const [activeTab, setActiveTab] = useState<keyof typeof MENU_DATA>('Academics')

  const tabs = [
    { id: 'Academics', label: 'Academics' },
    { id: 'Administrative', label: 'Administrative' },
    { id: 'Important_Links', label: 'Important Links' },
    { id: 'Student_Services', label: 'Student Services' }
  ] as const

  return (
    <div className="bg-white rounded-xl border shadow-sm mt-8 overflow-hidden" style={{ borderColor: 'var(--color-border)' }}>
      {/* Tab Navigation */}
      <div className="flex border-b overflow-x-auto" style={{ borderColor: 'var(--color-border)' }}>
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as keyof typeof MENU_DATA)}
            className={`px-6 py-4 text-sm font-medium transition-colors whitespace-nowrap focus:outline-none ${
              activeTab === tab.id
                ? 'border-b-2'
                : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
            }`}
            style={
              activeTab === tab.id 
                ? { color: 'var(--color-navy)', borderColor: 'var(--color-gold)' } 
                : {}
            }
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content (Columns) */}
      <div className="p-8">
        <div className="columns-1 md:columns-2 lg:columns-3 xl:columns-4 gap-8 space-y-8">
          {MENU_DATA[activeTab].map((section, idx) => (
            <div key={idx} className="break-inside-avoid">
              <h3 
                className="font-bold text-sm uppercase tracking-wider mb-3 flex items-center"
                style={{ color: 'var(--color-navy)' }}
              >
                <span className="w-1.5 h-1.5 rounded-full mr-2" style={{ backgroundColor: 'var(--color-gold)' }}></span>
                {section.title}
              </h3>
              <ul className="space-y-2">
                {section.links.map((link, linkIdx) => (
                  <li key={linkIdx}>
                    <Link 
                      href={link.href}
                      className="text-sm text-gray-600 hover:underline transition-all hover:text-gray-900 block py-0.5"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
