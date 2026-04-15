import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

// ── Helpers ───────────────────────────────────────────────────
const skillsToArray = (skills) => {
  if (Array.isArray(skills)) return skills;
  if (typeof skills === 'string') return skills.split(',').map((s) => s.trim()).filter(Boolean);
  return [];
};

const skillsToString = (skills) => {
  if (Array.isArray(skills)) return skills.join(', ');
  return skills || '';
};

const emptyForm = () => ({
  personalInfo: { name: '', email: '', phone: '', summary: '', jobTitle: '' },
  education: [],
  experience: [],
  skills: '',
});

// ── Toast Notification ────────────────────────────────────────
function Toast({ message, type, onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 3500);
    return () => clearTimeout(t);
  }, [onClose]);

  const colors = {
    success: 'bg-[#16a34a]/20 border-[#16a34a]/40 text-[#4ade80]',
    error:   'bg-error/10 border-error/30 text-error',
    info:    'bg-primary/10 border-primary/30 text-primary',
  };
  const icons = { success: 'check_circle', error: 'error', info: 'info' };

  return (
    <div className={`fixed bottom-24 right-6 flex items-center gap-3 px-5 py-3 rounded-xl border shadow-xl text-sm font-semibold z-50 animate-slide-up ${colors[type]}`}>
      <span className="material-symbols-outlined text-base" style={{ fontVariationSettings: "'FILL' 1" }}>{icons[type]}</span>
      {message}
      <button onClick={onClose} className="ml-2 opacity-60 hover:opacity-100">
        <span className="material-symbols-outlined text-sm">close</span>
      </button>
    </div>
  );
}

// ── LaTeX Modal ───────────────────────────────────────────────
function LatexModal({ latex, onClose }) {
  const handleDownload = () => {
    const blob = new Blob([latex], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'resume.tex';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="w-full max-w-3xl bg-[#0c0c0f] border border-[#27272a] rounded-2xl shadow-2xl flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#27272a]">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>description</span>
            <h2 className="text-lg font-bold tracking-tight text-[#fafafa]">Generated LaTeX Resume</h2>
            <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20 font-mono">resume.tex</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleDownload}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-on-primary rounded-lg font-bold text-sm hover:opacity-90 active:scale-95 transition-all">
              <span className="material-symbols-outlined text-sm">download</span>
              Download .tex
            </button>
            <button onClick={onClose} className="p-2 text-secondary hover:text-on-background hover:bg-[#27272a] rounded-lg transition-colors">
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>
        </div>

        {/* Code Block */}
        <div className="flex-1 overflow-auto p-6">
          <pre className="text-xs text-[#a1a1aa] font-mono leading-relaxed whitespace-pre-wrap bg-[#09090b] rounded-xl p-6 border border-[#27272a]">
            {latex}
          </pre>
        </div>
      </div>
    </div>
  );
}

// ── Main Component ────────────────────────────────────────────
export default function DashboardPage() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState(emptyForm());
  const [resumeExists, setResumeExists] = useState(false);
  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [latexOutput, setLatexOutput] = useState('');
  const [toast, setToast] = useState(null);
  const [activeSection, setActiveSection] = useState('personal');

  const user = JSON.parse(localStorage.getItem('user') || '{}');

  // ── Data Fetching ─────────────────────────────────────────
  useEffect(() => {
    fetchResume();
  }, []);

  async function fetchResume() {
    try {
      const { data } = await api.get('/resume');
      setResumeExists(true);
      setFormData({
        personalInfo: { ...emptyForm().personalInfo, ...data.personalInfo },
        education: data.education || [],
        experience: data.experience || [],
        skills: skillsToString(data.skills),
      });
    } catch (err) {
      // 404 = no resume yet — that's fine, user fills fresh form
      if (err.response?.status !== 404) {
        showToast('Failed to load resume data.', 'error');
      }
    }
  }

  // ── Save ──────────────────────────────────────────────────
  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = {
        personalInfo: formData.personalInfo,
        education: formData.education,
        experience: formData.experience,
        skills: skillsToArray(formData.skills),
      };

      if (resumeExists) {
        await api.put('/resume', payload);
      } else {
        await api.post('/resume', payload);
        setResumeExists(true);
      }

      showToast('Resume saved successfully!', 'success');
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to save.', 'error');
    } finally {
      setSaving(false);
    }
  };

  // ── AI Generate ───────────────────────────────────────────
  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const payload = {
        personalInfo: formData.personalInfo,
        education: formData.education,
        experience: formData.experience,
        skills: skillsToArray(formData.skills),
      };
      const { data } = await api.post('/ai/generate', payload);
      setLatexOutput(data.latex);
      showToast('LaTeX resume generated!', 'success');
    } catch (err) {
      showToast(err.response?.data?.message || 'AI generation failed.', 'error');
    } finally {
      setGenerating(false);
    }
  };

  // ── Logout ────────────────────────────────────────────────
  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/auth');
  };

  // ── Form Handlers ─────────────────────────────────────────
  const handlePersonalChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      personalInfo: { ...prev.personalInfo, [e.target.name]: e.target.value },
    }));
  };

  const handleSkillsChange = (e) => {
    setFormData((prev) => ({ ...prev, skills: e.target.value }));
  };

  const addEducation = () => {
    setFormData((prev) => ({
      ...prev,
      education: [...prev.education, { college: '', degree: '', year: '', gpa: '' }],
    }));
  };

  const updateEducation = (index, field, value) => {
    const newEdu = [...formData.education];
    newEdu[index] = { ...newEdu[index], [field]: value };
    setFormData((prev) => ({ ...prev, education: newEdu }));
  };

  const removeEducation = (index) => {
    setFormData((prev) => ({
      ...prev,
      education: prev.education.filter((_, i) => i !== index),
    }));
  };

  const addExperience = () => {
    setFormData((prev) => ({
      ...prev,
      experience: [...prev.experience, { company: '', role: '', startDate: '', endDate: '', description: '' }],
    }));
  };

  const updateExperience = (index, field, value) => {
    const newExp = [...formData.experience];
    newExp[index] = { ...newExp[index], [field]: value };
    setFormData((prev) => ({ ...prev, experience: newExp }));
  };

  const removeExperience = (index) => {
    setFormData((prev) => ({
      ...prev,
      experience: prev.experience.filter((_, i) => i !== index),
    }));
  };

  // ── Toast Helper ──────────────────────────────────────────
  const showToast = (message, type = 'info') => setToast({ message, type });

  const navItems = [
    { id: 'personal',   label: 'Personal',   icon: 'person'     },
    { id: 'education',  label: 'Education',  icon: 'school'     },
    { id: 'experience', label: 'Experience', icon: 'work'       },
    { id: 'skills',     label: 'Skills',     icon: 'psychology' },
  ];

  return (
    <div className="bg-background text-on-background selection:bg-primary selection:text-on-primary min-h-screen">

      {/* ── Top Nav ── */}
      <header className="fixed top-0 w-full z-50 flex justify-between items-center px-6 h-16 bg-[#09090b] border-b border-[#27272a]">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>terminal</span>
          <span className="text-xl font-bold tracking-tighter text-[#fafafa]">Obsidian Resume</span>
        </div>
        <nav className="hidden md:flex items-center gap-1">
          {navItems.map((item) => (
            <a
              key={item.id}
              href={`#${item.id}`}
              onClick={() => setActiveSection(item.id)}
              className={`px-3 py-1.5 rounded-md text-sm font-semibold transition-colors ${
                activeSection === item.id
                  ? 'text-primary bg-primary/10'
                  : 'text-[#a1a1aa] hover:bg-[#27272a] hover:text-[#fafafa]'
              }`}
            >
              {item.label}
            </a>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <span className="text-xs text-secondary hidden sm:block font-medium">{user.email}</span>
          <button
            onClick={handleLogout}
            className="hover:bg-[#27272a] hover:text-[#fafafa] transition-colors p-2 rounded-lg active:scale-95 duration-150"
            title="Logout"
          >
            <span className="material-symbols-outlined text-[#a1a1aa]">logout</span>
          </button>
          <div className="h-8 w-8 rounded-full bg-surface-container-high border border-outline-variant overflow-hidden flex items-center justify-center">
            <span className="material-symbols-outlined text-sm">person</span>
          </div>
        </div>
      </header>

      {/* ── Side Nav ── */}
      <aside className="fixed left-0 top-16 bottom-0 w-64 flex-col p-4 bg-[#0c0c0f] border-r border-[#27272a] hidden md:flex">
        <div className="mb-8 px-3">
          <h2 className="text-xs font-bold uppercase tracking-widest text-secondary-fixed mb-1">Resume Sections</h2>
          <p className="text-xs text-secondary">Precision Builder</p>
        </div>
        <div className="space-y-1 flex-1">
          {navItems.map((item) => (
            <a
              key={item.id}
              href={`#${item.id}`}
              onClick={() => setActiveSection(item.id)}
              className={`flex items-center gap-3 p-3 rounded-lg transition-all duration-200 ${
                activeSection === item.id
                  ? 'bg-[#27272a] text-[#a78bfa] border-l-4 border-[#a78bfa]'
                  : 'text-[#a1a1aa] hover:bg-[#18181b] hover:text-[#fafafa]'
              }`}
            >
              <span className="material-symbols-outlined">{item.icon}</span>
              <span className="font-geist text-sm font-medium">{item.label}</span>
            </a>
          ))}
        </div>

        {/* Quick Generate in sidebar */}
        <button
          onClick={handleGenerate}
          disabled={generating}
          className="mt-auto w-full bg-primary text-on-primary py-3 rounded-lg font-bold hover:opacity-90 transition-opacity active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-60"
        >
          {generating ? (
            <><span className="material-symbols-outlined text-sm animate-spin">refresh</span> Generating...</>
          ) : (
            <><span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>bolt</span> Generate LaTeX</>
          )}
        </button>
      </aside>

      {/* ── Main Content ── */}
      <main className="md:ml-64 pt-24 pb-32 px-6 md:px-12 max-w-5xl mx-auto space-y-12">

        {/* ── Personal Info ── */}
        <section id="personal">
          <div className="mb-6">
            <h1 className="text-3xl font-extrabold tracking-tight text-on-surface mb-2">Personal Information</h1>
            <p className="text-secondary text-sm">Enter your contact details and a brief professional summary.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-8 bg-surface-container rounded-xl border border-outline-variant">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-secondary-fixed">Full Name</label>
              <input
                name="name" value={formData.personalInfo.name} onChange={handlePersonalChange}
                className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg p-3 focus:ring-2 focus:ring-primary focus:border-primary transition-all text-on-surface placeholder:text-outline outline-none"
                placeholder="John Doe" type="text" />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-secondary-fixed">Job Title</label>
              <input
                name="jobTitle" value={formData.personalInfo.jobTitle} onChange={handlePersonalChange}
                className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg p-3 focus:ring-2 focus:ring-primary focus:border-primary transition-all text-on-surface placeholder:text-outline outline-none"
                placeholder="Senior Systems Architect" type="text" />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-secondary-fixed">Email Address</label>
              <input
                name="email" value={formData.personalInfo.email} onChange={handlePersonalChange}
                className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg p-3 focus:ring-2 focus:ring-primary focus:border-primary transition-all text-on-surface placeholder:text-outline outline-none"
                placeholder="john@obsidian.io" type="email" />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-secondary-fixed">Phone Number</label>
              <input
                name="phone" value={formData.personalInfo.phone} onChange={handlePersonalChange}
                className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg p-3 focus:ring-2 focus:ring-primary focus:border-primary transition-all text-on-surface placeholder:text-outline outline-none"
                placeholder="+1 (555) 000-0000" type="tel" />
            </div>
            <div className="md:col-span-2 space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-secondary-fixed">Professional Summary</label>
              <textarea
                name="summary" value={formData.personalInfo.summary} onChange={handlePersonalChange}
                className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg p-3 focus:ring-2 focus:ring-primary focus:border-primary transition-all text-on-surface placeholder:text-outline outline-none resize-none"
                placeholder="Briefly describe your career journey and key achievements..." rows="4">
              </textarea>
            </div>
          </div>
        </section>

        {/* ── Education ── */}
        <section id="education" className="space-y-6">
          <div className="flex justify-between items-center px-2">
            <h2 className="text-xl font-bold tracking-tight text-on-surface flex items-center gap-2">
              <span className="material-symbols-outlined text-primary">school</span>
              Education
            </h2>
            <button onClick={addEducation} className="flex items-center gap-2 text-sm font-bold text-primary hover:bg-primary/10 px-4 py-2 rounded-lg transition-colors" type="button">
              <span className="material-symbols-outlined text-sm">add</span> Add Education
            </button>
          </div>

          {formData.education.map((edu, index) => (
            <div key={index} className="p-6 bg-surface-container rounded-xl border border-outline-variant border-l-4 border-l-primary/40 space-y-4 relative">
              <button onClick={() => removeEducation(index)} className="absolute top-4 right-4 p-2 text-secondary hover:text-error transition-colors" type="button">
                <span className="material-symbols-outlined">delete</span>
              </button>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pr-10">
                <input
                  value={edu.college} onChange={(e) => updateEducation(index, 'college', e.target.value)}
                  className="bg-surface-container-lowest border border-outline-variant rounded-lg p-3 focus:ring-2 focus:ring-primary outline-none text-on-surface placeholder:text-outline"
                  placeholder="University / Institution" type="text" />
                <input
                  value={edu.degree} onChange={(e) => updateEducation(index, 'degree', e.target.value)}
                  className="bg-surface-container-lowest border border-outline-variant rounded-lg p-3 focus:ring-2 focus:ring-primary outline-none text-on-surface placeholder:text-outline"
                  placeholder="Degree / Qualification" type="text" />
                <input
                  value={edu.year} onChange={(e) => updateEducation(index, 'year', e.target.value)}
                  className="bg-surface-container-lowest border border-outline-variant rounded-lg p-3 focus:ring-2 focus:ring-primary outline-none text-on-surface placeholder:text-outline"
                  placeholder="Year of Graduation" type="text" />
                <input
                  value={edu.gpa || ''} onChange={(e) => updateEducation(index, 'gpa', e.target.value)}
                  className="bg-surface-container-lowest border border-outline-variant rounded-lg p-3 focus:ring-2 focus:ring-primary outline-none text-on-surface placeholder:text-outline"
                  placeholder="GPA / Grade" type="text" />
              </div>
            </div>
          ))}

          {formData.education.length === 0 && (
            <div className="p-8 border border-dashed border-outline-variant rounded-xl text-center text-secondary">
              No education added yet.
            </div>
          )}
        </section>

        {/* ── Experience ── */}
        <section id="experience" className="space-y-6">
          <div className="flex justify-between items-center px-2">
            <h2 className="text-xl font-bold tracking-tight text-on-surface flex items-center gap-2">
              <span className="material-symbols-outlined text-tertiary">work</span>
              Experience
            </h2>
            <button onClick={addExperience} className="flex items-center gap-2 text-sm font-bold text-tertiary hover:bg-tertiary/10 px-4 py-2 rounded-lg transition-colors" type="button">
              <span className="material-symbols-outlined text-sm">add</span> Add Experience
            </button>
          </div>

          {formData.experience.map((exp, index) => (
            <div key={index} className="p-6 bg-surface-container rounded-xl border border-outline-variant border-l-4 border-l-tertiary/40 space-y-4 relative">
              <button onClick={() => removeExperience(index)} className="absolute top-4 right-4 p-2 text-secondary hover:text-error transition-colors" type="button">
                <span className="material-symbols-outlined">delete</span>
              </button>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pr-10">
                <input
                  value={exp.company} onChange={(e) => updateExperience(index, 'company', e.target.value)}
                  className="bg-surface-container-lowest border border-outline-variant rounded-lg p-3 focus:ring-2 focus:ring-primary outline-none text-on-surface placeholder:text-outline"
                  placeholder="Company Name" type="text" />
                <input
                  value={exp.role} onChange={(e) => updateExperience(index, 'role', e.target.value)}
                  className="bg-surface-container-lowest border border-outline-variant rounded-lg p-3 focus:ring-2 focus:ring-primary outline-none text-on-surface placeholder:text-outline"
                  placeholder="Role / Position" type="text" />
                <input
                  value={exp.startDate || ''} onChange={(e) => updateExperience(index, 'startDate', e.target.value)}
                  className="bg-surface-container-lowest border border-outline-variant rounded-lg p-3 focus:ring-2 focus:ring-primary outline-none text-on-surface placeholder:text-outline"
                  placeholder="Start Date (e.g. Jan 2022)" type="text" />
                <input
                  value={exp.endDate || ''} onChange={(e) => updateExperience(index, 'endDate', e.target.value)}
                  className="bg-surface-container-lowest border border-outline-variant rounded-lg p-3 focus:ring-2 focus:ring-primary outline-none text-on-surface placeholder:text-outline"
                  placeholder="End Date (or Present)" type="text" />
              </div>
              <textarea
                value={exp.description} onChange={(e) => updateExperience(index, 'description', e.target.value)}
                className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg p-3 focus:ring-2 focus:ring-primary outline-none resize-none text-on-surface placeholder:text-outline"
                placeholder="Key responsibilities and achievements..." rows="3">
              </textarea>
            </div>
          ))}

          {formData.experience.length === 0 && (
            <div className="p-8 border border-dashed border-outline-variant rounded-xl text-center text-secondary">
              No experience added yet.
            </div>
          )}
        </section>

        {/* ── Skills ── */}
        <section id="skills" className="space-y-6">
          <div className="px-2">
            <h2 className="text-xl font-bold tracking-tight text-on-surface flex items-center gap-2 mb-1">
              <span className="material-symbols-outlined text-primary">psychology</span>
              Skills
            </h2>
            <p className="text-xs text-secondary pl-9">Separate skills with commas.</p>
          </div>
          <div className="p-6 bg-surface-container rounded-xl border border-outline-variant">
            <textarea
              value={formData.skills} onChange={handleSkillsChange}
              className="w-full bg-surface-container-lowest border border-outline-variant rounded-lg p-3 focus:ring-2 focus:ring-primary outline-none resize-none text-on-surface placeholder:text-outline"
              placeholder="React, Node.js, Python, System Design, AWS, Docker..."
              rows="3">
            </textarea>
          </div>
        </section>

      </main>

      {/* ── Bottom Action Bar ── */}
      <div className="fixed bottom-0 left-0 right-0 md:left-64 h-20 bg-surface-container-high border-t border-outline-variant px-6 md:px-12 flex items-center justify-between z-40">
        <div className="flex items-center gap-2 text-secondary-fixed text-sm">
          <span
            className="material-symbols-outlined text-tertiary text-lg"
            style={{ fontVariationSettings: "'FILL' 1" }}
          >
            {resumeExists ? 'cloud_done' : 'cloud_off'}
          </span>
          {resumeExists ? 'Resume synced to cloud' : 'New resume — not saved yet'}
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2 rounded-lg font-bold border border-outline-variant text-on-surface hover:bg-surface-container-highest transition-colors active:scale-95 disabled:opacity-50 flex items-center gap-2"
          >
            {saving ? (
              <><span className="material-symbols-outlined text-sm animate-spin">refresh</span> Saving...</>
            ) : (
              <><span className="material-symbols-outlined text-sm">save</span> Save</>
            )}
          </button>
          <button
            onClick={handleGenerate}
            disabled={generating}
            className="px-6 py-2 rounded-lg font-bold bg-primary text-on-primary flex items-center gap-2 shadow-lg shadow-primary/20 hover:opacity-90 active:scale-95 transition-all disabled:opacity-50"
          >
            {generating ? (
              <><span className="material-symbols-outlined text-sm animate-spin">refresh</span> Generating...</>
            ) : (
              <><span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>bolt</span> Generate LaTeX</>
            )}
          </button>
        </div>
      </div>

      {/* ── LaTeX Modal ── */}
      {latexOutput && (
        <LatexModal latex={latexOutput} onClose={() => setLatexOutput('')} />
      )}

      {/* ── Toast ── */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  );
}
