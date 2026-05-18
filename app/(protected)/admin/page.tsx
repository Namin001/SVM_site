'use client';
import { useState, useEffect } from 'react';
import { Printer, ArrowUp, ArrowDown, UserRoundCog } from 'lucide-react';
import Link from 'next/link';

const CLASS_OPTIONS = [
  'LKG', 'UKG', 'I- std A', 'I-std B', 'II- std A', 'II-std B', 'III- std A', 'III-std B',
  'IV- std A', 'IV-std B', 'V- std A', 'V-std B', 'VI- std A', 'VI-std B', 'VII- std A',
  'VII-std B', 'VIII- std A', 'VIII-std B', 'IX- std A', 'IX-std B', 'X- std A', 'X-std B',
  'XI- A', 'XI- B', 'XI- C', 'XI- D', 'XII- A', 'XII- B', 'XII- C', 'XII- D'
];

function parseClassAndSection(fullClass: string) {
  if (!fullClass) return { std: '_______', sec: '_______' };
  const clean = fullClass.trim();

  let stdPart = clean;
  let secPart = '';

  if (clean.includes('-')) {
    const parts = clean.split('-');
    stdPart = parts[0].trim();
    let rest = parts[1].trim();
    if (rest.toLowerCase().startsWith('std')) {
      rest = rest.substring(3).trim();
    }
    secPart = rest;
  }

  const romanOrdinalMap: Record<string, string> = {
    'I': 'Ist',
    'II': 'II',
    'III': 'III',
    'IV': 'IV',
    'V': 'V',
    'VI': 'VI',
    'VII': 'VII',
    'VIII': 'VIII',
    'IX': 'IX',
    'X': 'X',
    'XI': 'XI',
    'XII': 'XII',
  };

  const stdUpper = stdPart.toUpperCase();
  const stdParsed = romanOrdinalMap[stdUpper] || (isNaN(Number(stdPart)) ? stdPart : `${stdPart}th`);

  return {
    std: stdParsed,
    sec: secPart || '_______'
  };
}

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('content');
  const [pages, setPages] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [posts, setPosts] = useState<any[]>([]);
  const [applications, setApplications] = useState<any[]>([]);
  const [classes, setClasses] = useState<any[]>([]);
  const [editingFees, setEditingFees] = useState<{ [key: string]: string }>({});
  const [isUpdatingFees, setIsUpdatingFees] = useState<{ [key: string]: boolean }>({});
  const [editingStudentFees, setEditingStudentFees] = useState('');
  const [isUpdatingStudentFees, setIsUpdatingStudentFees] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [careerApplications, setCareerApplications] = useState<any[]>([]);
  const [selectedCareer, setSelectedCareer] = useState<any>(null);

  // Banner Image Management
  const [bannerImages, setBannerImages] = useState<string[]>([]);
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [isUploadingBanner, setIsUploadingBanner] = useState(false);
  const [floaterSettings, setFloaterSettings] = useState({
    enabled: false,
    message: '',
    link: '',
    type: 'info'
  });
  const [isUpdatingFloater, setIsUpdatingFloater] = useState(false);

  // Content Editing State
  const [editingPage, setEditingPage] = useState<any>(null);
  const [contentForm, setContentForm] = useState('');
  const [isAdmissionOpen, setIsAdmissionOpen] = useState(false);
  const [isUpdatingAdmissionStatus, setIsUpdatingAdmissionStatus] = useState(false);
  const [filterClass, setFilterClass] = useState('All');
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [isBonafideMode, setIsBonafideMode] = useState(false);
  const [bonafideSection, setBonafideSection] = useState('');
  const [bonafidePurpose, setBonafidePurpose] = useState('');
  const [bonafideGender, setBonafideGender] = useState('Male');
  const [promoteClass, setPromoteClass] = useState('');
  const [isPromoting, setIsPromoting] = useState(false);
  const [resetPassword, setResetPassword] = useState('');
  const [isResetting, setIsResetting] = useState(false);
  const [isPromotingAnnual, setIsPromotingAnnual] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  // Post Management State
  const [postFormData, setPostFormData] = useState({
    title: '',
    subject: '',
    content: '',
    type: 'NEWSLETTER'
  });
  const [postImage, setPostImage] = useState<File | null>(null);
  const [additionalImages, setAdditionalImages] = useState<File[]>([]);
  const [postVideo, setPostVideo] = useState<File | null>(null);

  // User Creation State
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    name: '',
    admissionNo: '',
    age: '',
    gender: 'Male',
    className: '',
    section: '',
    role: 'PARENT',
    dob: '',
    joiningDate: '',
    fatherName: '',
    motherName: '',
    religion: '',
    caste: '',
    fatherPhone: '',
    motherPhone: ''
  });
  const [birthCert, setBirthCert] = useState<File | null>(null);
  const [aadhar, setAadhar] = useState<File | null>(null);
  const [transferCert, setTransferCert] = useState<File | null>(null);
  const [profilePhoto, setProfilePhoto] = useState<File | null>(null);
  const [selectedTeacherIds, setSelectedTeacherIds] = useState<string[]>([]);

  useEffect(() => {
    fetchPages();
    fetchUsers();
    fetchPosts();
    fetchBannerImages();
    fetchApplications();
    fetchClasses();
    fetchFloaterSettings();
    fetchCareers();
  }, []);

  const fetchCareers = async () => {
    const res = await fetch('/api/careers');
    if (res.ok) setCareerApplications(await res.json());
  };

  const updateCareerStatus = async (id: string, status: string) => {
    try {
      const res = await fetch('/api/careers', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status })
      });
      if (res.ok) {
        fetchCareers();
        setMessage('Career application updated');
        setTimeout(() => setMessage(''), 3000);
      }
    } catch (err) {
      alert('Update failed');
    }
  };

  const fetchApplications = async () => {
    const res = await fetch('/api/applications');
    if (res.ok) setApplications(await res.json());
  };

  const deleteApplication = async (id: string) => {
    if (!confirm('Are you sure you want to delete this admission application?')) return;
    try {
      const res = await fetch(`/api/applications?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchApplications();
        setMessage('Application deleted successfully');
        setTimeout(() => setMessage(''), 3000);
      }
    } catch (err) {
      alert('Delete failed');
    }
  };

  const deleteCareer = async (id: string) => {
    if (!confirm('Are you sure you want to delete this career application?')) return;
    try {
      const res = await fetch(`/api/careers?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchCareers();
        setMessage('Career application deleted');
        setTimeout(() => setMessage(''), 3000);
      }
    } catch (err) {
      alert('Delete failed');
    }
  };

  const deleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user? This cannot be undone.')) return;
    try {
      const res = await fetch('/api/users', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId })
      });
      if (res.ok) {
        setMessage('User deleted successfully');
        fetchUsers();
        setTimeout(() => setMessage(''), 3000);
      } else {
        const data = await res.json();
        alert(data.error || 'Delete failed');
      }
    } catch (err) {
      alert('Delete failed');
    }
  };

  const resetUserPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser || !resetPassword) return;
    setIsResetting(true);
    try {
      const res = await fetch('/api/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: selectedUser.id, newPassword: resetPassword })
      });
      if (res.ok) {
        setMessage('Password reset successfully');
        setResetPassword('');
        setTimeout(() => setMessage(''), 3000);
      }
    } catch (err) {
      alert('Reset failed');
    } finally {
      setIsResetting(false);
    }
  };

  const runAnnualPromotions = async () => {
    if (!confirm('This will promote all eligible students to their next class. Continue?')) return;
    setIsPromotingAnnual(true);
    try {
      const res = await fetch('/api/admin/promote-annual', { method: 'POST' });
      const data = await res.json();
      if (res.ok) {
        setMessage(data.message);
        fetchUsers();
        setTimeout(() => setMessage(''), 5000);
      } else {
        alert(data.error);
      }
    } catch (err) {
      alert('Promotion process failed');
    } finally {
      setIsPromotingAnnual(false);
    }
  };

  const fetchBannerImages = async () => {
    const res = await fetch('/api/home-banner');
    if (res.ok) setBannerImages(await res.json());
  };

  const fetchPages = async () => {
    const res = await fetch('/api/content');
    if (res.ok) {
      const data = await res.json();
      const statusRec = data.find((p: any) => p.pageId === 'admission_status');
      setIsAdmissionOpen(statusRec?.content === 'OPEN');
      // Ensure 'admission' is always in the list for editing
      if (!data.find((p: any) => p.pageId === 'admission')) {
        data.push({ id: 'temp-adm', pageId: 'admission', content: '', updatedAt: new Date() });
      }
      setPages(data);
    }
  };

  const toggleAdmissionStatus = async (isOpen: boolean) => {
    setIsUpdatingAdmissionStatus(true);
    try {
      const res = await fetch('/api/content', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pageId: 'admission_status', content: isOpen ? 'OPEN' : 'CLOSED' })
      });
      if (res.ok) {
        setIsAdmissionOpen(isOpen);
        setMessage(`Admissions are now ${isOpen ? 'OPEN' : 'CLOSED'}`);
        setTimeout(() => setMessage(''), 3000);
      }
    } catch (err) {
      alert('Failed to update admission status');
    } finally {
      setIsUpdatingAdmissionStatus(false);
    }
  };

  const fetchUsers = async () => {
    const res = await fetch('/api/users');
    if (res.ok) {
      const data = await res.json();
      setUsers(data.users || []);
    }
  };

  const fetchClasses = async () => {
    const res = await fetch('/api/classes');
    if (res.ok) setClasses(await res.json());
  };

  const updateClassFees = async (className: string, defaultFees: string) => {
    setIsUpdatingFees(prev => ({ ...prev, [className]: true }));
    try {
      const res = await fetch('/api/classes', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ className, defaultFees })
      });
      if (res.ok) {
        setMessage(`Fees updated for ${className}`);
        setEditingFees(prev => {
          const newFees = { ...prev };
          delete newFees[className];
          return newFees;
        });
        fetchClasses();
        setTimeout(() => setMessage(''), 3000);
      }
    } catch (err) {
      alert('Failed to update fees');
    } finally {
      setIsUpdatingFees(prev => ({ ...prev, [className]: false }));
    }
  };

  const updateStudentFees = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;
    setIsUpdatingStudentFees(true);
    try {
      const res = await fetch('/api/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: selectedUser.id, feesPaid: editingStudentFees })
      });
      if (res.ok) {
        const data = await res.json();
        setMessage(`Fees updated for ${selectedUser.name || selectedUser.username}`);
        setSelectedUser({ ...selectedUser, feesPaid: data.feesPaid });
        setEditingStudentFees('');
        fetchUsers();
        setTimeout(() => setMessage(''), 3000);
      }
    } catch (err) {
      alert('Failed to update student fees');
    } finally {
      setIsUpdatingStudentFees(false);
    }
  };

  const toggleUserStatus = async (userId: string, currentStatus: boolean) => {
    setIsUpdatingStatus(true);
    try {
      const res = await fetch('/api/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, isActive: !currentStatus })
      });
      if (res.ok) {
        const data = await res.json();
        setMessage(`Status updated to ${data.isActive ? 'Active' : 'Left'}`);
        if (selectedUser && selectedUser.id === userId) {
          setSelectedUser({ ...selectedUser, isActive: data.isActive });
        }
        fetchUsers();
        setTimeout(() => setMessage(''), 3000);
      }
    } catch (err) {
      alert('Failed to update status');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const fetchPosts = async () => {
    const resNewsletter = await fetch('/api/posts?type=NEWSLETTER');
    const resUpdate = await fetch('/api/posts?type=UPDATE');
    const resAdmission = await fetch('/api/posts?type=ADMISSION');
    const resEvent = await fetch('/api/posts?type=EVENT');
    if (resNewsletter.ok && resUpdate.ok && resAdmission.ok && resEvent.ok) {
      const n = await resNewsletter.json();
      const u = await resUpdate.json();
      const a = await resAdmission.json();
      const e = await resEvent.json();

      const sortByOrder = (arr: any[]) => arr.sort((a, b) => {
        if (a.order !== b.order) return a.order - b.order;
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });

      setPosts([...sortByOrder(n), ...sortByOrder(u), ...sortByOrder(a), ...sortByOrder(e)]);
    }
  };

  // Filter teachers for enrollment selection
  const teachers = users.filter(u => u.role === 'TEACHER');

  const saveContent = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/content', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ pageId: editingPage.pageId, content: contentForm })
    });
    if (res.ok) {
      setMessage('Content saved successfully');
      fetchPages();
      setEditingPage(null);
      setTimeout(() => setMessage(''), 3000);
    } else {
      setMessage('Failed to save content');
    }
  };

  const createPost = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage('');
    const body = new FormData();
    Object.entries(postFormData).forEach(([key, value]) => body.append(key, value));
    if (postImage) body.append('image', postImage);
    additionalImages.forEach(img => body.append('additionalImages', img));
    if (postVideo) body.append('video', postVideo);
    try {
      const res = await fetch('/api/posts', { method: 'POST', body });
      if (res.ok) {
        setMessage('Post created successfully');
        setPostFormData({ title: '', subject: '', content: '', type: 'NEWSLETTER' });
        setPostImage(null);
        setAdditionalImages([]);
        setPostVideo(null);
        fetchPosts();
        setTimeout(() => setMessage(''), 3000);
      } else {
        const data = await res.json();
        setMessage(`${data.error || 'Failed to create post'}${data.details ? ': ' + data.details : ''}`);
      }
    } catch (err) {
      setMessage('An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const deletePost = async (id: string) => {
    if (!confirm('Are you sure you want to delete this post?')) return;
    const res = await fetch(`/api/posts?id=${id}`, { method: 'DELETE' });
    if (res.ok) {
      setMessage('Post deleted');
      fetchPosts();
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const movePost = async (id: string, direction: 'up' | 'down') => {
    const postIndex = posts.findIndex(p => p.id === id);
    if (postIndex === -1) return;

    const postType = posts[postIndex].type;
    const sameTypePosts = posts.filter(p => p.type === postType);
    const indexInType = sameTypePosts.findIndex(p => p.id === id);

    if (direction === 'up' && indexInType === 0) return;
    if (direction === 'down' && indexInType === sameTypePosts.length - 1) return;

    const newSameTypePosts = [...sameTypePosts];
    const targetIndex = direction === 'up' ? indexInType - 1 : indexInType + 1;

    [newSameTypePosts[indexInType], newSameTypePosts[targetIndex]] = [newSameTypePosts[targetIndex], newSameTypePosts[indexInType]];

    const orders = newSameTypePosts.map((p, i) => ({ id: p.id, order: i }));

    const res = await fetch('/api/posts', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orders })
    });

    if (res.ok) {
      fetchPosts();
    }
  };

  const createUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setMessage('');
    const body = new FormData();
    Object.entries(formData).forEach(([key, value]) => body.append(key, value));

    body.append('assignedTeacherIds', JSON.stringify(selectedTeacherIds));

    if (birthCert) body.append('birthCert', birthCert);
    if (aadhar) body.append('aadhar', aadhar);
    if (transferCert) body.append('transferCert', transferCert);
    if (profilePhoto) body.append('image', profilePhoto);

    try {
      const res = await fetch('/api/users', { method: 'POST', body });
      if (res.ok) {
        setMessage('Account created successfully');
        setFormData({
          username: '', password: '', name: '',
          admissionNo: '', age: '', gender: 'Male',
          className: '', section: '', role: 'PARENT',
          dob: '', joiningDate: '',
          fatherName: '', motherName: '',
          religion: '', caste: '',
          fatherPhone: '', motherPhone: ''
        });
        setBirthCert(null);
        setAadhar(null);
        setTransferCert(null);
        setProfilePhoto(null);
        setSelectedTeacherIds([]);
        fetchUsers();
        setTimeout(() => setMessage(''), 3000);
      } else {
        const data = await res.json();
        setMessage(data.error || 'Failed to create account');
      }
    } catch (err) {
      setMessage('An error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const promoteStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser || !promoteClass) return;
    setIsPromoting(true);

    try {
      const res = await fetch('/api/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: selectedUser.id, newClassName: promoteClass })
      });

      if (res.ok) {
        setMessage(`Successfully promoted ${selectedUser.name || selectedUser.username} to ${promoteClass}!`);
        setSelectedUser({ ...selectedUser, className: promoteClass });
        fetchUsers();
        setTimeout(() => setMessage(''), 3000);
      } else {
        alert('Failed to promote user');
      }
    } catch (err) {
      alert('An error occurred while promoting');
    } finally {
      setIsPromoting(false);
    }
  };

  const uploadBanner = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bannerFile) return;
    setIsUploadingBanner(true);

    const formData = new FormData();
    formData.append('image', bannerFile);

    try {
      const res = await fetch('/api/home-banner', {
        method: 'POST',
        body: formData
      });
      if (res.ok) {
        setBannerImages(await res.json());
        setBannerFile(null);
        setMessage('Banner image uploaded successfully');
        setTimeout(() => setMessage(''), 3000);
      } else {
        alert('Failed to upload banner');
      }
    } catch (err) {
      alert('Upload failed');
    } finally {
      setIsUploadingBanner(false);
    }
  };

  const deleteBanner = async (path: string) => {
    if (!confirm('Are you sure you want to delete this background?')) return;
    try {
      const res = await fetch('/api/home-banner', {
        method: 'DELETE',
        body: JSON.stringify({ imagePath: path })
      });
      if (res.ok) setBannerImages(await res.json());
    } catch (err) {
      alert('Delete failed');
    }
  };

  const fetchFloaterSettings = async () => {
    const res = await fetch('/api/floaters');
    if (res.ok) setFloaterSettings(await res.json());
  };

  const updateFloaterSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsUpdatingFloater(true);
    try {
      const res = await fetch('/api/floaters', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(floaterSettings)
      });
      if (res.ok) {
        setMessage('Floater settings updated successfully');
        setTimeout(() => setMessage(''), 3000);
      }
    } catch (err) {
      alert('Failed to update floaters');
    } finally {
      setIsUpdatingFloater(false);
    }
  };

  return (
    <div className="page-container animate-fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '3rem' }}>
        <h1 style={{ margin: 0, fontFamily: 'Outfit', border: 'none' }}>Admin Console</h1>
        <div style={{
          padding: '0.5rem 1.25rem',
          background: 'rgba(47, 133, 90, 0.1)',
          color: 'var(--success)',
          borderRadius: '30px',
          fontSize: '0.85rem',
          fontWeight: 700,
          border: '1px solid var(--success)',
          letterSpacing: '1px'
        }}>
          SECURE ACCESS
        </div>
      </div>

      {message && <div className="admin-banner">{message}</div>}

      <div className="admin-nav" style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
        <button className={`admin-nav-btn ${activeTab === 'content' ? 'active' : ''}`} onClick={() => setActiveTab('content')}>Manage Website</button>
        <button className={`admin-nav-btn ${activeTab === 'posts' ? 'active' : ''}`} onClick={() => setActiveTab('posts')}>Announcements</button>
        <button className={`admin-nav-btn ${activeTab === 'users' ? 'active' : ''}`} onClick={() => setActiveTab('users')}>Student Enrollment</button>
        <button className={`admin-nav-btn ${activeTab === 'applications' ? 'active' : ''}`} onClick={() => setActiveTab('applications')}>Admissions App</button>
        <button className={`admin-nav-btn ${activeTab === 'classes' ? 'active' : ''}`} onClick={() => setActiveTab('classes')}>Classes</button>
        <button className={`admin-nav-btn ${activeTab === 'banner' ? 'active' : ''}`} onClick={() => setActiveTab('banner')}>Home Backgrounds</button>
        <button className={`admin-nav-btn ${activeTab === 'careers' ? 'active' : ''}`} onClick={() => setActiveTab('careers')}>Careers ({careerApplications.length})</button>
        <Link href="/admin/teachers" className="admin-nav-btn" style={{ textDecoration: 'none', background: 'rgba(252, 163, 17, 0.1)', color: 'var(--accent)', border: '1px solid rgba(252, 163, 17, 0.2)' }}>
          <UserRoundCog size={16} style={{ marginRight: '8px' }} />
          Faculty Management
        </Link>
      </div>

      {activeTab === 'content' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
              <div style={{ width: '8px', height: '24px', background: 'var(--accent)', borderRadius: '4px' }}></div>
              <h2 style={{ margin: 0 }}>Dynamic Floating Notices</h2>
            </div>
            <form onSubmit={updateFloaterSettings} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '1rem', background: 'rgba(10, 54, 104, 0.03)', padding: '1rem', borderRadius: '12px', border: '1px solid rgba(10, 54, 104, 0.1)' }}>
                  <label className="form-label" style={{ marginBottom: 0, cursor: 'pointer' }}>
                    Enable Floater on Home Page
                  </label>
                  <input
                    type="checkbox"
                    checked={floaterSettings.enabled}
                    onChange={e => setFloaterSettings({ ...floaterSettings, enabled: e.target.checked })}
                    style={{ width: '24px', height: '24px', cursor: 'pointer' }}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Notice Message</label>
                  <textarea
                    className="input"
                    value={floaterSettings.message}
                    onChange={e => setFloaterSettings({ ...floaterSettings, message: e.target.value })}
                    placeholder="e.g. Admission for 2026 is now open!"
                    style={{ minHeight: '80px' }}
                  />
                </div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                <div className="form-group">
                  <label className="form-label">Link URL (Optional)</label>
                  <input
                    className="input"
                    value={floaterSettings.link}
                    onChange={e => setFloaterSettings({ ...floaterSettings, link: e.target.value })}
                    placeholder="/admissions"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Notice Theme</label>
                  <select
                    className="input"
                    value={floaterSettings.type}
                    onChange={e => setFloaterSettings({ ...floaterSettings, type: e.target.value as any })}
                  >
                    <option value="info">Blue (Information)</option>
                    <option value="success">Green (Success/Major Event)</option>
                    <option value="warning">Orange (Urgent/Warning)</option>
                  </select>
                </div>
              </div>
              <div style={{ gridColumn: 'span 2' }}>
                <button type="submit" className="btn" disabled={isUpdatingFloater} style={{ width: '100%', padding: '1rem' }}>
                  {isUpdatingFloater ? 'Updating...' : 'Save Floater Settings'}
                </button>
              </div>
            </form>
          </div>

          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
              <div style={{ width: '8px', height: '24px', background: 'var(--success)', borderRadius: '4px' }}></div>
              <h2 style={{ margin: 0 }}>Admission Portal Status</h2>
            </div>
            <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: '1rem', background: 'rgba(10, 54, 104, 0.03)', padding: '1rem', borderRadius: '12px', border: '1px solid rgba(10, 54, 104, 0.1)' }}>
              <label className="form-label" style={{ marginBottom: 0, cursor: 'pointer', flex: 1 }}>
                {isAdmissionOpen ? '🟢 Admissions are currently OPEN' : '🔴 Admissions are currently CLOSED'}
              </label>
              <button
                type="button"
                className="btn"
                onClick={() => toggleAdmissionStatus(!isAdmissionOpen)}
                disabled={isUpdatingAdmissionStatus}
                style={{ background: isAdmissionOpen ? 'var(--error)' : 'var(--success)' }}
              >
                {isUpdatingAdmissionStatus ? 'Updating...' : (isAdmissionOpen ? 'Close Admissions' : 'Open Admissions')}
              </button>
            </div>
          </div>

          <div className="card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
              <div style={{ width: '8px', height: '24px', background: 'var(--primary)', borderRadius: '4px' }}></div>
              <h2 style={{ margin: 0 }}>Active Sections</h2>
            </div>
            {editingPage ? (
              <form onSubmit={saveContent}>
                <div className="form-group">
                  <label className="form-label">Editing <strong>{editingPage.pageId}</strong> page</label>
                  <textarea className="input textarea" value={contentForm} onChange={(e) => setContentForm(e.target.value)} style={{ minHeight: '300px' }} />
                </div>
                <div style={{ display: 'flex', gap: '1rem' }}>
                  <button type="submit" className="btn">Save Changes</button>
                  <button type="button" className="btn danger" onClick={() => setEditingPage(null)}>Cancel</button>
                </div>
              </form>
            ) : (
              <div className="table-container">
                <table>
                  <thead><tr><th>Page ID</th><th>Last Updated</th><th>Action</th></tr></thead>
                  <tbody>
                    {pages.map(p => (
                      <tr key={p.id}>
                        <td style={{ textTransform: 'capitalize', fontWeight: 600 }}>{p.pageId}</td>
                        <td>{new Date(p.updatedAt).toLocaleDateString()}</td>
                        <td><button className="btn" onClick={() => { setEditingPage(p); setContentForm(p.content); }}>Edit Content</button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'posts' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '2rem' }}>
          <div className="card">
            <h2>New Announcement</h2>
            <form onSubmit={createPost}>
              <div className="form-group">
                <label className="form-label">Title</label>
                <input className="input" value={postFormData.title} onChange={e => setPostFormData({ ...postFormData, title: e.target.value })} required />
              </div>
              <div className="form-group">
                <label className="form-label">Subject</label>
                <input className="input" value={postFormData.subject} onChange={e => setPostFormData({ ...postFormData, subject: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Category</label>
                <select className="input" value={postFormData.type} onChange={e => setPostFormData({ ...postFormData, type: e.target.value })}>
                  <option value="NEWSLETTER">Newsletter</option>
                  <option value="UPDATE">Home Page Update</option>
                  <option value="ADMISSION">Admission Section Update</option>
                  <option value="EVENT">School Event</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Featured Image</label>
                <input type="file" className="input" onChange={e => setPostImage(e.target.files?.[0] || null)} />
              </div>
              <div className="form-group">
                <label className="form-label">Additional Images (Gallery)</label>
                <input type="file" className="input" multiple onChange={e => setAdditionalImages(Array.from(e.target.files || []))} />
                <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>Select multiple images for a gallery view.</p>
              </div>
              <div className="form-group">
                <label className="form-label">Video (Optional)</label>
                <input type="file" className="input" accept="video/*" onChange={e => setPostVideo(e.target.files?.[0] || null)} />
                <p style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>MP4/WebM supported.</p>
              </div>
              <div className="form-group">
                <label className="form-label">Body Content</label>
                <textarea className="input textarea" value={postFormData.content} onChange={e => setPostFormData({ ...postFormData, content: e.target.value })} required />
              </div>
              <button type="submit" className="btn" disabled={isSubmitting} style={{ width: '100%' }}>{isSubmitting ? 'Publishing...' : 'Publish Post'}</button>
            </form>
          </div>
          <div className="card">
            <h2>History</h2>
            <div className="table-container">
              <table>
                <thead><tr><th>Title</th><th>Type</th><th>Order</th><th>Action</th></tr></thead>
                <tbody>
                  {posts.map(p => (
                    <tr key={p.id}>
                      <td style={{ fontWeight: 600 }}>{p.title}</td>
                      <td><span className={`tag ${p.type.toLowerCase()}`}>{p.type}</span></td>
                      <td>
                        <div style={{ display: 'flex', gap: '0.25rem' }}>
                          <button className="btn" style={{ padding: '0.2rem', minWidth: '30px' }} onClick={() => movePost(p.id, 'up')} title="Move Up"><ArrowUp size={14} /></button>
                          <button className="btn" style={{ padding: '0.2rem', minWidth: '30px' }} onClick={() => movePost(p.id, 'down')} title="Move Down"><ArrowDown size={14} /></button>
                        </div>
                      </td>
                      <td><button className="btn danger" onClick={() => deletePost(p.id)}>Delete</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'users' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <div className="card animate-fade-in" style={{ border: '1px solid rgba(10, 54, 104, 0.1)', background: 'rgba(10, 54, 104, 0.02)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h2 style={{ margin: 0, color: 'var(--primary)', border: 'none', paddingBottom: 0 }}>Academic Year Management</h2>
                <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                  Perform manual student promotions. Will immediately promote all students to their next respective classes.
                </p>
              </div>
              <button
                className="btn"
                style={{ background: 'var(--primary)', color: 'white', padding: '0.75rem 1.5rem', gap: '0.75rem' }}
                onClick={runAnnualPromotions}
                disabled={isPromotingAnnual}
              >
                <ArrowUp size={18} /> {isPromotingAnnual ? 'Promoting Students...' : 'Run Annual Promotions'}
              </button>
            </div>
          </div>
          <div className="card">
            <h2 style={{ marginBottom: '0.5rem' }}>Full User Enrollment</h2>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>Add Students, Teachers, or Parents to the registry.</p>

            <form onSubmit={createUser}>
              <h3 style={{ fontSize: '0.9rem', color: 'var(--primary)', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem', marginBottom: '1rem' }}>1. Account Credentials</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Username (Student ID)</label>
                  <input className="input" value={formData.username} onChange={e => setFormData({ ...formData, username: e.target.value })} required placeholder="e.g. STU123" />
                </div>
                <div className="form-group">
                  <label className="form-label">Account Password</label>
                  <input className="input" type="password" value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} required placeholder="••••••••" />
                </div>
              </div>

              <h3 style={{ fontSize: '0.9rem', color: 'var(--primary)', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem', marginBottom: '1rem', marginTop: '2rem' }}>2. Personal Details</h3>
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input className="input" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} required />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Date of Birth</label>
                  <input type="date" className="input" value={formData.dob} onChange={e => setFormData({ ...formData, dob: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Date of Joining</label>
                  <input type="date" className="input" value={formData.joiningDate} onChange={e => setFormData({ ...formData, joiningDate: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Gender</label>
                  <select className="input" value={formData.gender} onChange={e => setFormData({ ...formData, gender: e.target.value })}>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Passport Size Photo (Profile Photo)</label>
                <input type="file" className="input file-input" onChange={e => setProfilePhoto(e.target.files?.[0] || null)} />
              </div>

              <h3 style={{ fontSize: '0.9rem', color: 'var(--primary)', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem', marginBottom: '1rem', marginTop: '2rem' }}>3. Parent & Background Info</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Father's Name</label>
                  <input className="input" value={formData.fatherName} onChange={e => setFormData({ ...formData, fatherName: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Mother's Name</label>
                  <input className="input" value={formData.motherName} onChange={e => setFormData({ ...formData, motherName: e.target.value })} />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Father's Phone Number</label>
                  <input className="input" value={formData.fatherPhone} onChange={e => setFormData({ ...formData, fatherPhone: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Mother's Phone Number</label>
                  <input className="input" value={formData.motherPhone} onChange={e => setFormData({ ...formData, motherPhone: e.target.value })} />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Religion</label>
                  <select className="input" value={formData.religion} onChange={e => setFormData({ ...formData, religion: e.target.value })}>
                    <option value="">Select Religion</option>
                    <option value="Hindu">Hindu</option>
                    <option value="Muslim">Muslim</option>
                    <option value="Christian">Christian</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Caste</label>
                  <select className="input" value={formData.caste} onChange={e => setFormData({ ...formData, caste: e.target.value })}>
                    <option value="">Select Caste</option>
                    <option value="General">General</option>
                    <option value="BC">BC</option>
                    <option value="MBC">MBC</option>
                    <option value="SC">SC</option>
                    <option value="ST">ST</option>
                    <option value="EWS">EWS</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <h3 style={{ fontSize: '0.9rem', color: 'var(--primary)', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem', marginBottom: '1rem', marginTop: '2rem' }}>4. Academic Info</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Class</label>
                  <select className="input" value={formData.className} onChange={e => setFormData({ ...formData, className: e.target.value })} required>
                    <option value="">Select a Class</option>
                    {CLASS_OPTIONS.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Admission No</label>
                  <input className="input" value={formData.admissionNo} onChange={e => setFormData({ ...formData, admissionNo: e.target.value })} />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Assign Teachers</label>
                <div className="teacher-grid">
                  {teachers.map(t => (
                    <div key={t.id} className={`teacher-chip ${selectedTeacherIds.includes(t.id) ? 'selected' : ''}`} onClick={() => {
                      setSelectedTeacherIds(prev => prev.includes(t.id) ? prev.filter(id => id !== t.id) : [...prev, t.id]);
                    }}>
                      {t.name || t.username}
                    </div>
                  ))}
                </div>
              </div>

              <h3 style={{ fontSize: '0.9rem', color: 'var(--primary)', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem', marginBottom: '1rem', marginTop: '2rem' }}>4. Documents (Uploads)</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Birth Cert</label>
                  <input type="file" className="input file-input" onChange={e => setBirthCert(e.target.files?.[0] || null)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Aadhar</label>
                  <input type="file" className="input file-input" onChange={e => setAadhar(e.target.files?.[0] || null)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Transfer Cert</label>
                  <input type="file" className="input file-input" onChange={e => setTransferCert(e.target.files?.[0] || null)} />
                </div>
              </div>

              <button type="submit" className="btn" disabled={isSubmitting} style={{ width: '100%', marginTop: '1rem' }}>
                {isSubmitting ? 'Enrolling...' : 'Register Account'}
              </button>
            </form>
          </div>

          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '1rem' }}>
              <h2 style={{ margin: 0 }}>Current Registry</h2>
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                <input
                  type="text"
                  className="input"
                  placeholder="Search name, username, or admission no..."
                  style={{ width: '300px', padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                />
                <select className="input" style={{ width: 'auto', padding: '0.4rem 0.8rem', fontSize: '0.85rem' }} value={filterClass} onChange={e => setFilterClass(e.target.value)}>
                  <option value="All">All Classes</option>
                  {CLASS_OPTIONS.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
            </div>
            <div className="table-container" style={{ maxHeight: '400px', overflowY: 'auto' }}>
              <table style={{ position: 'relative' }}>
                <thead style={{ position: 'sticky', top: 0, background: 'white', zIndex: 1, boxShadow: '0 1px 2px rgba(0,0,0,0.05)' }}><tr><th>Profile</th><th>Name</th><th>Status</th><th>DOB</th><th>Class</th><th>Action</th></tr></thead>
                <tbody>
                  {users.filter(u => u.role === 'PARENT').filter(u => {
                    const matchesClass = filterClass === 'All' || u.className === filterClass;
                    const searchLower = searchQuery.toLowerCase();
                    const matchesSearch = !searchQuery ||
                      (u.name && u.name.toLowerCase().includes(searchLower)) ||
                      (u.username && u.username.toLowerCase().includes(searchLower)) ||
                      (u.admissionNo && u.admissionNo.toLowerCase().includes(searchLower));
                    return matchesClass && matchesSearch;
                  }).map(u => (
                    <tr key={u.id}>
                      <td>
                        <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: '#eee', overflow: 'hidden' }}>
                          {u.imagePath ? <img src={u.imagePath} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : null}
                        </div>
                      </td>
                      <td style={{ fontWeight: 600 }}>{u.name || u.username}</td>
                      <td>
                        <span className={`tag ${u.isActive ? 'success' : 'left'}`} style={{
                          background: u.isActive ? '#dcfce7' : '#f1f5f9',
                          color: u.isActive ? '#166534' : '#64748b'
                        }}>
                          {u.isActive ? 'Active' : 'Left'}
                        </span>
                      </td>
                      <td style={{ fontSize: '0.8rem' }}>{u.dob}</td>
                      <td>{u.className}</td>
                      <td>
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <button className="btn" style={{ padding: '0.2rem 0.5rem', fontSize: '0.7rem' }} onClick={(e) => { e.preventDefault(); setSelectedUser(u); }}>View Info</button>
                          <button className="btn danger" style={{ padding: '0.2rem 0.5rem', fontSize: '0.7rem' }} onClick={(e) => { e.preventDefault(); deleteUser(u.id); }}>Delete</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'applications' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <div className="card animate-fade-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ margin: 0 }}>Online Applications</h2>
              <button className="btn" onClick={fetchApplications}>Refresh List</button>
            </div>
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Student Name</th>
                    <th>Grade</th>
                    <th>Parent Name</th>
                    <th>Phone</th>
                    <th>Date Submitted</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {applications.length === 0 ? (
                    <tr><td colSpan={6} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>No applications received yet.</td></tr>
                  ) : (
                    applications.map(app => (
                      <tr key={app.id}>
                        <td style={{ fontWeight: 700, color: 'var(--primary)' }}>{app.studentName}</td>
                        <td>{app.grade}</td>
                        <td>{app.parentName}</td>
                        <td>{app.phone}</td>
                        <td>{new Date(app.createdAt).toLocaleDateString()}</td>
                        <td>
                          <span className={`tag ${app.status.toLowerCase()}`} style={{
                            background: app.status === 'PENDING' ? '#fff7ed' : '#dcfce7',
                            color: app.status === 'PENDING' ? '#9a3412' : '#166534'
                          }}>
                            {app.status}
                          </span>
                          <button
                            className="btn danger"
                            style={{ marginLeft: '0.5rem', padding: '0.2rem 0.5rem', fontSize: '0.7rem' }}
                            onClick={() => deleteApplication(app.id)}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="card animate-fade-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ margin: 0 }}>School Events</h2>
              <button className="btn" onClick={() => {
                setActiveTab('posts');
                setPostFormData({ ...postFormData, type: 'EVENT' });
              }}>Add New Event</button>
            </div>
            <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>These events will appear on the home page when users click the calendar icon.</p>
            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Event Title</th>
                    <th>Date</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {posts.filter(p => p.type === 'EVENT').length === 0 ? (
                    <tr><td colSpan={3} style={{ textAlign: 'center', padding: '2rem', color: '#999' }}>No events scheduled.</td></tr>
                  ) : (
                    posts.filter(p => p.type === 'EVENT').map(event => (
                      <tr key={event.id}>
                        <td style={{ fontWeight: 600 }}>{event.title}</td>
                        <td>{new Date(event.createdAt).toLocaleDateString()}</td>
                        <td>
                          <button className="btn danger" style={{ padding: '0.2rem 0.5rem', fontSize: '0.7rem' }} onClick={() => deletePost(event.id)}>Delete</button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'classes' && (
        <div className="card animate-fade-in">
          <h2>Classes Management</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>Manage all classes, view statistics, and set default fee structures.</p>
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Class Name</th>
                  <th>Total Students</th>
                  <th>Total Teachers</th>
                  <th>Default Fees (₹)</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {CLASS_OPTIONS.map(className => {
                  const dbClass = classes.find(c => c.name === className) || { defaultFees: 0 };
                  const studentsCount = users.filter(u => u.className === className && u.role === 'PARENT').length;
                  const teachersCount = users.filter(u => u.className === className && u.role === 'TEACHER').length;

                  return (
                    <tr key={className}>
                      <td style={{ fontWeight: 600 }}>{className}</td>
                      <td>{studentsCount}</td>
                      <td>{teachersCount}</td>
                      <td>
                        <input
                          type="number"
                          className="input"
                          style={{ width: '120px', padding: '0.4rem' }}
                          value={editingFees[className] !== undefined ? editingFees[className] : dbClass.defaultFees}
                          onChange={(e) => setEditingFees({ ...editingFees, [className]: e.target.value })}
                        />
                      </td>
                      <td>
                        <button
                          className="btn"
                          style={{ padding: '0.4rem 1rem' }}
                          disabled={isUpdatingFees[className]}
                          onClick={() => updateClassFees(className, editingFees[className] !== undefined ? editingFees[className] : dbClass.defaultFees.toString())}
                        >
                          {isUpdatingFees[className] ? 'Saving...' : 'Save Fees'}
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'banner' && (
        <>
          <div className="card animate-fade-in">
            <h2>Home Screen Backgrounds</h2>
            <p style={{ color: 'var(--text-muted)', marginBottom: '1.5rem' }}>Upload images for the home page slideshow. Professional, high-resolution landscapes or campus photos work best.</p>

            <form onSubmit={uploadBanner} style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '2rem', padding: '1.5rem', background: '#f8f9fa', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
              <input type="file" className="input" style={{ width: 'auto' }} onChange={(e) => setBannerFile(e.target.files?.[0] || null)} required />
              <button type="submit" className="btn" disabled={isUploadingBanner || !bannerFile}>
                {isUploadingBanner ? 'Uploading...' : 'Upload Image'}
              </button>
            </form>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1.5rem' }}>
              {bannerImages.length === 0 && (
                <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '3rem', border: '2px dashed #ddd', borderRadius: '8px', color: '#999' }}>
                  No custom backgrounds uploaded yet. Home page will use default gradient.
                </div>
              )}
              {bannerImages.map((img, idx) => (
                <div key={idx} style={{ position: 'relative', borderRadius: '8px', overflow: 'hidden', boxShadow: '0 4px 6px rgba(0,0,0,0.1)', border: '1px solid #ddd' }}>
                  <img src={img} alt={`Banner ${idx}`} style={{ width: '100%', height: '120px', objectFit: 'cover' }} />
                  <button onClick={() => deleteBanner(img)} style={{ position: 'absolute', top: '5px', right: '5px', background: 'rgba(239, 68, 68, 0.9)', color: 'white', border: 'none', borderRadius: '4px', padding: '4px 8px', fontSize: '0.7rem', cursor: 'pointer' }}>Delete</button>
                </div>
              ))}
            </div>
          </div>
        </>
      )}

      {activeTab === 'careers' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <div className="card animate-fade-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ margin: 0 }}>Hiring & Career Applications</h2>
              <div style={{ padding: '0.4rem 1rem', background: 'var(--primary)', color: 'white', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 600 }}>
                {careerApplications.length} Candidates
              </div>
            </div>

            <div className="table-container">
              <table>
                <thead>
                  <tr>
                    <th>Candidate</th>
                    <th>Contact</th>
                    <th>Expertise</th>
                    <th>Education</th>
                    <th>Applied Date</th>
                    <th>Resume</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {careerApplications.length > 0 ? careerApplications.map((app) => (
                    <tr key={app.id}>
                      <td style={{ fontWeight: 700, color: 'var(--primary)' }}>{app.fullName}</td>
                      <td style={{ fontSize: '0.85rem' }}>
                        <div>{app.email}</div>
                        <div style={{ opacity: 0.6 }}>{app.phone}</div>
                      </td>
                      <td>
                        <span className="tag" style={{ background: 'rgba(10, 54, 104, 0.05)', color: 'var(--primary)', border: '1px solid rgba(10, 54, 104, 0.1)' }}>
                          {app.expertise}
                        </span>
                      </td>
                      <td style={{ fontSize: '0.85rem', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={app.education}>
                        {app.education}
                      </td>
                      <td style={{ fontSize: '0.8rem' }}>{new Date(app.createdAt).toLocaleDateString()}</td>
                      <td>
                        <a
                          href={app.resumePath}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn"
                          style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem', background: 'var(--accent)', color: 'var(--primary)' }}
                        >
                          View Resume
                        </a>
                      </td>
                      <td>
                        <span className={`tag ${app.status.toLowerCase()}`}>{app.status}</span>
                      </td>
                      <td>
                        <select
                          value={app.status}
                          onChange={(e) => updateCareerStatus(app.id, e.target.value)}
                          style={{ padding: '0.3rem', borderRadius: '4px', fontSize: '0.8rem', border: '1px solid var(--border-color)' }}
                        >
                          <option value="RESUME_CHECKING">Resume Checking</option>
                          <option value="MOCK_CLASS">Interview/Mock Class</option>
                          <option value="FINALIZATION">Finalization</option>
                          <option value="ACCEPTED">Accepted</option>
                          <option value="REJECTED">Rejected</option>
                        </select>
                        <button className="btn" style={{ marginLeft: '0.5rem', padding: '0.3rem 0.5rem', fontSize: '0.75rem' }} onClick={() => setSelectedCareer(app)}>
                          Profile
                        </button>
                        <button
                          className="btn danger"
                          style={{ marginLeft: '0.5rem', padding: '0.3rem 0.5rem', fontSize: '0.75rem' }}
                          onClick={() => deleteCareer(app.id)}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={8} style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                        No career applications found yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {selectedCareer && (
        <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) setSelectedCareer(null); }}>
          <div className="modal-content animate-fade-in" style={{ maxWidth: '800px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem', marginBottom: '1.5rem' }}>
              <h2 style={{ margin: 0 }}>Candidate Profile</h2>
              <button className="btn danger" style={{ padding: '0.2rem 0.5rem' }} onClick={() => setSelectedCareer(null)}>Close</button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
              <div>
                <h3 style={{ fontSize: '1rem', color: 'var(--primary)', borderBottom: '1px solid #eee', paddingBottom: '0.5rem' }}>Personal Info</h3>
                <div style={{ display: 'grid', gap: '0.5rem', fontSize: '0.9rem', marginTop: '1rem' }}>
                  <div><strong>Full Name:</strong> {selectedCareer.fullName}</div>
                  <div><strong>Email:</strong> {selectedCareer.email}</div>
                  <div><strong>Phone:</strong> {selectedCareer.phone}</div>
                  <div><strong>Domain:</strong> {selectedCareer.domain === 'Others' ? selectedCareer.domainOther : selectedCareer.domain}</div>
                  <div><strong>Applied On:</strong> {new Date(selectedCareer.createdAt).toLocaleDateString()}</div>
                </div>
              </div>

              <div>
                <h3 style={{ fontSize: '1rem', color: 'var(--primary)', borderBottom: '1px solid #eee', paddingBottom: '0.5rem' }}>Academic Record</h3>
                <div style={{ display: 'grid', gap: '0.5rem', fontSize: '0.9rem', marginTop: '1rem' }}>
                  <div><strong>Xth Standard:</strong> {selectedCareer.xMark} ({selectedCareer.xMedium} Medium)</div>
                  <div><strong>XIIth Standard:</strong> {selectedCareer.xiiMark} ({selectedCareer.xiiMedium} Medium)</div>
                  <div><strong>UG:</strong> {selectedCareer.ugStream} ({selectedCareer.ugCgpa || 'N/A'})</div>
                  <div><strong>PG:</strong> {selectedCareer.pgStream} ({selectedCareer.pgCgpa || 'N/A'})</div>
                  <div><strong>B.Ed Status:</strong> {selectedCareer.bedStatus}</div>
                </div>
              </div>
            </div>

            <div style={{ marginTop: '2rem', padding: '1.5rem', background: 'rgba(10, 54, 104, 0.05)', borderRadius: '12px', textAlign: 'center' }}>
              <h4 style={{ margin: '0 0 1rem 0' }}>Resume / CV</h4>
              <a href={selectedCareer.resumePath} target="_blank" rel="noopener noreferrer" className="btn" style={{ background: 'var(--primary)', color: 'white', textDecoration: 'none' }}>
                View & Download Resume
              </a>
            </div>
          </div>
        </div>
      )}

      {selectedUser && (
        <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) { setSelectedUser(null); setIsBonafideMode(false); } }}>
          <div className={`modal-content animate-fade-in ${isBonafideMode ? 'bonafide-print-area' : ''}`} style={{ maxWidth: isBonafideMode ? '800px' : '600px', width: '100%' }}>

            {isBonafideMode ? (
              <div className="bonafide-certificate" style={{ padding: '2rem', background: 'white' }}>
                <div className="no-print" style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '2rem', gap: '1rem' }}>
                  <button className="btn" onClick={() => window.print()}><Printer size={16} style={{ marginRight: '8px' }} /> Print Form</button>
                  <button className="btn danger" onClick={() => setIsBonafideMode(false)}>Cancel</button>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '2px solid var(--primary)', paddingBottom: '1rem', marginBottom: '2rem' }}>
                  <div style={{ width: '100px', height: '100px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <img src="/svm_logo.png" alt="School Logo" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                  </div>
                  <div style={{ textAlign: 'center', flex: 1, padding: '0 1rem' }}>
                    <h1 style={{ color: 'var(--primary)', margin: 0, fontSize: '1.8rem', fontFamily: 'Outfit, sans-serif' }}>SHUBHA VIDYALAYA MATRICULATION HIGHER SECONDARY SCHOOL</h1>
                    <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.9rem', color: '#555', fontWeight: 600 }}>(No.1, SHUBHAM CAMPUS, ALIVALAM ROAD, METTUPALAYAM, THIRUVARUR, 610001)</p>
                  </div>
                  <div style={{ width: '100px', height: '120px', border: '1px solid #ccc', background: '#f9f9f9', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                    {selectedUser.imagePath ? (
                      <img src={selectedUser.imagePath} alt="Student Photo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <span style={{ fontSize: '0.7rem', color: '#999', textAlign: 'center' }}>Photo<br />Here</span>
                    )}
                  </div>
                </div>

                <h2 style={{ textAlign: 'center', textDecoration: 'underline', marginBottom: '3rem', letterSpacing: '2px' }}>BONAFIDE CERTIFICATE</h2>

                <div style={{ fontSize: '1.2rem', lineHeight: '2.2', textAlign: 'justify', marginBottom: '2rem' }}>
                  This is to certify that <strong>{selectedUser.name || selectedUser.username}</strong> Ad.No <strong>{selectedUser.admissionNo || '_______'}</strong> <strong>{bonafideGender?.toLowerCase() === 'female' ? 'D/O' : 'S/O'}</strong> Thiru <strong>{selectedUser.fatherName || '_______'}</strong> is a bonafide student of our school studying <strong>{parseClassAndSection(selectedUser.className).std}</strong> standard <strong>{parseClassAndSection(selectedUser.className).sec}</strong> Section during the academic year <strong>{new Date().getMonth() < 4 ? `${new Date().getFullYear() - 1}-${new Date().getFullYear().toString().slice(2)}` : `${new Date().getFullYear()}-${(new Date().getFullYear() + 1).toString().slice(2)}`}</strong> and <strong>{bonafideGender?.toLowerCase() === 'female' ? 'her' : 'his'}</strong> Date Of Birth is <strong>{selectedUser.dob ? new Date(selectedUser.dob).toLocaleDateString() : '_______'}</strong> and <strong>{bonafideGender?.toLowerCase() === 'female' ? 'she' : 'he'}</strong> belongs to <strong>Refer Community Certificate</strong> community as per the school records.
                </div>

                <div style={{ fontSize: '1.2rem', lineHeight: '2.2', textAlign: 'justify', marginBottom: '4rem' }}>
                  Purpose of Issuing this Certificate : <strong>{bonafidePurpose || '_________________________________'}</strong>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4rem', fontSize: '1.1rem', fontWeight: 'bold' }}>
                  <div>
                    <div>Date: {new Date().toLocaleDateString()}</div>
                    <div style={{ marginTop: '0.5rem', fontSize: '0.9rem', color: '#666', fontWeight: 'normal' }}>
                      Valid upto: {new Date(new Date().setMonth(new Date().getMonth() + 1)).toLocaleDateString()}
                    </div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ width: '200px', borderBottom: '1px solid black', marginBottom: '0.5rem' }}></div>
                    Principal's Signature
                  </div>
                </div>
              </div>
            ) : (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem', marginBottom: '1rem' }}>
                  <h2 style={{ margin: 0 }}>Student Info</h2>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button className="btn no-print" style={{ padding: '0.2rem 0.75rem', background: 'var(--primary)', gap: '0.5rem' }} onClick={() => window.print()}>
                      <Printer size={16} /> Print Info
                    </button>
                    <button className="btn danger no-print" style={{ padding: '0.2rem 0.5rem' }} onClick={() => { setSelectedUser(null); setIsBonafideMode(false); }}>Close</button>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: '1.5rem', alignItems: 'start' }}>
                  <div style={{ width: '120px', height: '120px', borderRadius: '8px', background: '#f5f5f5', overflow: 'hidden', border: '1px solid #ddd' }}>
                    {selectedUser.imagePath ? <img src={selectedUser.imagePath} alt="Passport Photo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <div style={{ padding: '2rem', textAlign: 'center', color: '#999', fontSize: '0.8rem' }}>No Photo</div>}
                  </div>
                  <div>
                    <h3 style={{ margin: '0 0 0.5rem 0' }}>{selectedUser.name || selectedUser.username}</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', fontSize: '0.9rem' }}>
                      <div><strong>Role:</strong> <span className={`tag ${selectedUser.role.toLowerCase()}`}>{selectedUser.role === 'PARENT' ? 'STUDENT' : selectedUser.role}</span></div>
                      <div><strong>Class:</strong> {selectedUser.className || 'N/A'}</div>
                      <div><strong>Admission No:</strong> {selectedUser.admissionNo || 'N/A'}</div>
                      <div><strong>DOB:</strong> {selectedUser.dob || 'N/A'}</div>
                      <div><strong>Joining Date:</strong> {selectedUser.joiningDate || 'N/A'}</div>
                      <div><strong>Father:</strong> {selectedUser.fatherName || 'N/A'}</div>
                      <div><strong>Mother:</strong> {selectedUser.motherName || 'N/A'}</div>
                      <div><strong>Father's Phone:</strong> {selectedUser.fatherPhone || 'N/A'}</div>
                      <div><strong>Mother's Phone:</strong> {selectedUser.motherPhone || 'N/A'}</div>
                      <div><strong>Religion:</strong> {selectedUser.religion || 'N/A'}</div>
                      <div><strong>Caste:</strong> {selectedUser.caste || 'N/A'}</div>
                    </div>
                  </div>
                </div>

                <div className="no-print" style={{ marginTop: '1.5rem', padding: '1.5rem', background: '#f8fafc', borderRadius: '16px', border: '2px solid #e2e8f0' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <h3 style={{ fontSize: '1rem', color: '#1e293b', marginBottom: '0.25rem', marginTop: 0 }}>Enrollment Status</h3>
                      <p style={{ fontSize: '0.8rem', color: '#64748b', margin: 0 }}>
                        Manage if this student is currently attending or has left.
                      </p>
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button
                        className="btn"
                        style={{
                          background: selectedUser.isActive ? '#22c55e' : '#f1f5f9',
                          color: selectedUser.isActive ? 'white' : '#64748b',
                          border: '1px solid ' + (selectedUser.isActive ? '#16a34a' : '#cbd5e1'),
                          padding: '0.5rem 1rem',
                          fontWeight: 700
                        }}
                        onClick={() => !selectedUser.isActive && toggleUserStatus(selectedUser.id, false)}
                      >
                        Active
                      </button>
                      <button
                        className="btn"
                        style={{
                          background: !selectedUser.isActive ? '#64748b' : '#f1f5f9',
                          color: !selectedUser.isActive ? 'white' : '#64748b',
                          border: '1px solid ' + (!selectedUser.isActive ? '#475569' : '#cbd5e1'),
                          padding: '0.5rem 1rem',
                          fontWeight: 700
                        }}
                        onClick={() => selectedUser.isActive && toggleUserStatus(selectedUser.id, true)}
                      >
                        Left
                      </button>
                    </div>
                  </div>
                </div>

                {selectedUser.role === 'PARENT' && (
                  <>
                    <div className="no-print" style={{ marginTop: '1.5rem', background: 'rgba(10, 54, 104, 0.05)', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                      <h3 style={{ fontSize: '0.9rem', color: 'var(--primary)', marginBottom: '0.5rem', marginTop: 0 }}>Login Credentials</h3>
                      <div style={{ marginBottom: '1rem', fontSize: '0.9rem' }}>
                        <strong>User ID:</strong> <code style={{ background: '#eee', padding: '0.2rem 0.4rem', borderRadius: '4px' }}>{selectedUser.username}</code>
                      </div>
                      <form onSubmit={resetUserPassword} style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                        <input
                          type="password"
                          className="input"
                          style={{ flex: 1 }}
                          placeholder="Set New Password..."
                          value={resetPassword}
                          onChange={(e) => setResetPassword(e.target.value)}
                          required
                        />
                        <button type="submit" className="btn" disabled={isResetting || !resetPassword}>
                          {isResetting ? 'Resetting...' : 'Reset Password'}
                        </button>
                      </form>
                    </div>

                    <div className="no-print" style={{ marginTop: '1.5rem', background: '#f8f9fa', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                      <h3 style={{ fontSize: '0.9rem', color: 'var(--primary)', marginBottom: '0.5rem', marginTop: 0 }}>Promote / Reassign Class</h3>
                      <form onSubmit={promoteStudent} style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                        <select className="input" style={{ flex: 1 }} value={promoteClass} onChange={(e) => setPromoteClass(e.target.value)} required>
                          <option value="">Select Next Class...</option>
                          {CLASS_OPTIONS.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                        <button type="submit" className="btn" disabled={isPromoting || promoteClass === selectedUser.className}>
                          {isPromoting ? 'Promoting...' : 'Promote Student'}
                        </button>
                      </form>
                    </div>

                    <div className="no-print" style={{ marginTop: '1.5rem', background: '#f8f9fa', padding: '1rem', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
                      <h3 style={{ fontSize: '0.9rem', color: 'var(--primary)', marginBottom: '1rem', marginTop: 0 }}>Fee Details</h3>
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                        <div>
                          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Default Class Fee</div>
                          <div style={{ fontSize: '1.1rem', fontWeight: 600 }}>
                            ₹{classes.find(c => c.name === selectedUser.className)?.defaultFees || 0}
                          </div>
                        </div>
                        <div>
                          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Paid Fees</div>
                          <div style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--success)' }}>
                            ₹{selectedUser.feesPaid || 0}
                          </div>
                        </div>
                        <div>
                          <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Balance Due</div>
                          <div style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--danger)' }}>
                            ₹{Math.max(0, (classes.find(c => c.name === selectedUser.className)?.defaultFees || 0) - (selectedUser.feesPaid || 0))}
                          </div>
                        </div>
                      </div>

                      <form onSubmit={updateStudentFees} style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                        <input
                          type="number"
                          className="input"
                          style={{ flex: 1 }}
                          placeholder="Update Paid Amount..."
                          value={editingStudentFees}
                          onChange={(e) => setEditingStudentFees(e.target.value)}
                          required
                        />
                        <button type="submit" className="btn" disabled={isUpdatingStudentFees}>
                          {isUpdatingStudentFees ? 'Updating...' : 'Update Paid Amount'}
                        </button>
                      </form>
                    </div>
                  </>
                )}

                <div className="no-print" style={{ marginTop: '1.5rem', background: '#f0f9ff', padding: '1rem', borderRadius: '8px', border: '1px solid #bae6fd' }}>
                  <h3 style={{ fontSize: '0.9rem', color: '#0369a1', marginBottom: '0.5rem', marginTop: 0 }}>Bonafide Certificate</h3>
                  <p style={{ fontSize: '0.8rem', color: '#0284c7', margin: '0 0 1rem 0' }}>Generate a printable bonafide certificate for this student valid for 1 month.</p>
                  <button
                    className="btn"
                    style={{ background: '#0284c7', color: 'white', border: 'none', padding: '0.5rem 1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
                    onClick={() => {
                      const pur = window.prompt("Enter Purpose of Issuing this Certificate:");
                      if (pur === null) return; // Cancelled

                      const gen = window.prompt("Enter Student Gender (Type 'Male' or 'Female'):", selectedUser.gender || "Male");
                      if (gen === null) return; // Cancelled

                      setBonafidePurpose(pur);
                      setBonafideGender(gen);

                      setIsBonafideMode(true);
                      setTimeout(() => window.print(), 200);
                    }}
                  >
                    <Printer size={16} /> Generate & Print Bonafide
                  </button>
                </div>

                <h3 style={{ fontSize: '0.9rem', color: 'var(--primary)', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem', marginBottom: '1rem', marginTop: '2rem' }}>Uploaded Documents</h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                  {selectedUser.birthCertPath ? (
                    <a href={selectedUser.birthCertPath} target="_blank" rel="noreferrer" className="doc-link">📄 Birth Certificate</a>
                  ) : <span className="doc-missing">No Birth Cert</span>}

                  {selectedUser.aadharPath ? (
                    <a href={selectedUser.aadharPath} target="_blank" rel="noreferrer" className="doc-link">📄 Aadhar Card</a>
                  ) : <span className="doc-missing">No Aadhar</span>}

                  {selectedUser.transferCertPath ? (
                    <a href={selectedUser.transferCertPath} target="_blank" rel="noreferrer" className="doc-link">📄 Transfer Cert</a>
                  ) : <span className="doc-missing">No TC</span>}
                </div>

                <div className="no-print" style={{ marginTop: '2rem', padding: '1.5rem', border: '1px solid #fee2e2', borderRadius: '12px', background: '#fff1f1' }}>
                  <h3 style={{ fontSize: '0.9rem', color: '#991b1b', marginBottom: '0.5rem', marginTop: 0 }}>Danger Zone</h3>
                  <p style={{ fontSize: '0.8rem', color: '#991b1b', opacity: 0.8, marginBottom: '1rem' }}>Permanently delete this student record and all associated data. This action cannot be undone.</p>
                  <button
                    className="btn danger"
                    style={{ width: '100%', padding: '0.75rem' }}
                    onClick={() => {
                      deleteUser(selectedUser.id);
                      setSelectedUser(null);
                    }}
                  >
                    Delete Student Record Permanently
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      <style jsx>{`
        .admin-nav-btn {
            background: rgba(255, 255, 255, 0.05); border: 1px solid var(--border-color); padding: 0.75rem 1.5rem; 
            color: var(--text-muted); cursor: pointer; border-radius: 30px;
            font-weight: 600; transition: all 0.3s; font-size: 0.9rem;
        }
        .admin-nav-btn:hover { background: rgba(10, 54, 104, 0.05); color: var(--primary); }
        .admin-nav-btn.active { 
            background: var(--primary); 
            color: white; 
            border-color: var(--primary);
            box-shadow: 0 4px 12px rgba(10, 54, 104, 0.2);
        }
        .tag { padding: 4px 10px; border-radius: 20px; font-size: 0.7rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px; }
        .tag.parent { background: #e0f2fe; color: #0369a1; }
        .tag.teacher { background: #fef3c7; color: #92400e; }
        .tag.admin { background: #fee2e2; color: #991b1b; }
        .tag.pending { background: #fff7ed; color: #9a3412; }
        .tag.accepted { background: #dcfce7; color: #166534; }
        .tag.success { background: #dcfce7; color: #166534; }
        .tag.left { background: #f1f5f9; color: #64748b; }
        
        .toggle-switch {
            width: 50px; height: 26px; background: #e2e8f0; border-radius: 13px; position: relative; cursor: pointer; transition: all 0.3s;
            border: 1px solid #cbd5e1;
        }
        .toggle-switch.active { background: var(--success); border-color: #166534; }
        .toggle-handle {
            width: 20px; height: 20px; background: white; border-radius: 50%; position: absolute;
            top: 2px; left: 2px; transition: all 0.3s; box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        .toggle-switch.active .toggle-handle { left: 26px; }
        
        .modal-overlay {
            position: fixed; top: 0; left: 0; width: 100%; height: 100%;
            background: rgba(0,0,0,0.7); display: flex; align-items: center; justify-content: center;
            z-index: 1000; backdrop-filter: blur(5px);
        }
        @media print {
            body * { visibility: hidden; }
            .bonafide-certificate, .bonafide-certificate * { visibility: visible; }
            .bonafide-certificate { position: absolute; left: 0; top: 0; width: 100%; padding: 0 !important; }
            .no-print { display: none !important; }
        }
        .modal-content {
            background: white; padding: 2.5rem; border-radius: 24px; width: 90%; max-height: 90vh; overflow-y: auto;
            position: relative; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
        }
        .doc-link {
            display: flex; align-items: center; gap: 0.5rem; padding: 0.75rem; background: #f8f9fa;
            border-radius: 8px; text-decoration: none; color: var(--primary); font-weight: 600;
            border: 1px solid #dee2e6; transition: all 0.2s;
        }
        .doc-link:hover { background: #e9ecef; transform: translateY(-2px); }
        .doc-missing { font-size: 0.8rem; color: #999; font-style: italic; }
        .teacher-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(120px, 1fr)); gap: 0.5rem; margin-top: 0.5rem; }
        .teacher-chip { 
            padding: 0.5rem; border: 1px solid #ddd; border-radius: 8px; font-size: 0.8rem; text-align: center; cursor: pointer; transition: all 0.2s;
            background: white; color: #666;
        }
        .teacher-chip:hover { border-color: var(--primary); color: var(--primary); }
        .teacher-chip.selected { background: var(--primary); color: white; border-color: var(--primary); font-weight: 700; }
        
        @media print {
            .no-print { display: none !important; }
            body { background: white !important; }
            .modal-overlay { position: absolute !important; background: white !important; backdrop-filter: none !important; }
            .modal-content { box-shadow: none !important; border: none !important; width: 100% !important; max-height: none !important; padding: 0 !important; margin: 0 !important; }
        }
      `}</style>
    </div>
  );
}
