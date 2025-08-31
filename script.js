document.addEventListener('DOMContentLoaded', () => {
    const jobForm = document.getElementById('job-form');
    const jobsContainer = document.getElementById('jobs-container');
    const userJobsContainer = document.getElementById('user-jobs-container');
    const loginBtn = document.getElementById('login-btn');
    const registerBtn = document.getElementById('register-btn');
    const logoutBtn = document.getElementById('logout-btn');
    const dashboardBtn = document.getElementById('dashboard-btn');
    const authSection = document.getElementById('auth-section');
    const loginFormDiv = document.getElementById('login-form');
    const registerFormDiv = document.getElementById('register-form');
    const postJobSection = document.getElementById('post-job');
    const dashboardSection = document.getElementById('dashboard');
    const currentUserSpan = document.getElementById('current-user');

    // Wait for Firebase to load
    setTimeout(() => {
        const auth = window.auth;
        const signInWithEmailAndPassword = window.signInWithEmailAndPassword;
        const createUserWithEmailAndPassword = window.createUserWithEmailAndPassword;
        const signOut = window.signOut;
        const onAuthStateChanged = window.onAuthStateChanged;

        // Auth state listener
        onAuthStateChanged(auth, (user) => {
            updateUI(user);
        });

        // Update UI based on login status
        function updateUI(user) {
            if (user) {
                loginBtn.style.display = 'none';
                registerBtn.style.display = 'none';
                logoutBtn.style.display = 'inline';
                dashboardBtn.style.display = 'inline';
                const name = localStorage.getItem(`userName_${user.uid}`) || user.email;
                currentUserSpan.textContent = `مرحباً ${name}`;
                postJobSection.style.display = 'block';
                authSection.style.display = 'none';
                dashboardSection.style.display = 'none';
            } else {
                loginBtn.style.display = 'inline';
                registerBtn.style.display = 'inline';
                logoutBtn.style.display = 'none';
                dashboardBtn.style.display = 'none';
                currentUserSpan.textContent = '';
                postJobSection.style.display = 'none';
                authSection.style.display = 'none';
                dashboardSection.style.display = 'none';
            }
            loadJobs();
        }

        // Google Sign-In
        document.getElementById('login').addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('login-email').value.trim();
            const password = document.getElementById('login-password').value.trim();
            try {
                await signInWithEmailAndPassword(auth, email, password);
                document.getElementById('login').reset();
            } catch (error) {
                alert('بيانات غير صحيحة');
            }
        });

        // Register
        document.getElementById('register').addEventListener('submit', async (e) => {
            e.preventDefault();
            const name = document.getElementById('reg-name').value.trim();
            const email = document.getElementById('reg-email').value.trim();
            const password = document.getElementById('reg-password').value.trim();
            try {
                const userCredential = await createUserWithEmailAndPassword(auth, email, password);
                const user = userCredential.user;
                localStorage.setItem(`userName_${user.uid}`, name);
                document.getElementById('register').reset();
            } catch (error) {
                alert('خطأ في التسجيل: ' + error.message);
            }
        });

        // Google Sign-In button
        const googleSignInBtn = document.createElement('button');
        googleSignInBtn.textContent = 'تسجيل الدخول باستخدام جوجل';
        googleSignInBtn.style.marginTop = '10px';
        googleSignInBtn.addEventListener('click', async () => {
            try {
                const result = await signInWithPopup(auth, provider);
                const user = result.user;
                localStorage.setItem(`userName_${user.uid}`, user.displayName || user.email);
            } catch (error) {
                alert('خطأ في تسجيل الدخول بجوجل: ' + error.message);
            }
        });
        loginFormDiv.appendChild(googleSignInBtn);

        // Logout
        logoutBtn.addEventListener('click', async () => {
            try {
                await signOut(auth);
            } catch (error) {
                console.error('Logout error:', error);
            }
        });

        // Show login
        loginBtn.addEventListener('click', () => {
            authSection.style.display = 'block';
            loginFormDiv.style.display = 'block';
            registerFormDiv.style.display = 'none';
        });

        // Show register
        registerBtn.addEventListener('click', () => {
            authSection.style.display = 'block';
            loginFormDiv.style.display = 'none';
            registerFormDiv.style.display = 'block';
        });

        // Show dashboard
        dashboardBtn.addEventListener('click', () => {
            loadUserJobs();
            dashboardSection.style.display = 'block';
            postJobSection.style.display = 'none';
        });

        // Job form submit
        jobForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const user = auth.currentUser;
            if (!user) return;
            const businessName = document.getElementById('business-name').value.trim();
            const jobTitle = document.getElementById('job-title').value.trim();
            const jobDescription = document.getElementById('job-description').value.trim();
            if (businessName && jobTitle && jobDescription) {
                const newJob = {
                    businessName,
                    jobTitle,
                    jobDescription,
                    userId: user.uid,
                    userName: localStorage.getItem(`userName_${user.uid}`) || user.email
                };
                saveJob(newJob);
                loadJobs();
                jobForm.reset();
            }
        });

        // Load jobs from localStorage
        function loadJobs() {
            const jobs = JSON.parse(localStorage.getItem('jobs')) || [];
            jobsContainer.innerHTML = '';
            jobs.forEach((job) => {
                const jobDiv = document.createElement('div');
                jobDiv.classList.add('job');
                const whatsappLink = `<a href="https://wa.me/${job.userPhone || ''}" class="whatsapp-link" target="_blank">تواصل عبر واتساب</a>`;
                jobDiv.innerHTML = `
                    <h3>${job.jobTitle}</h3>
                    <p><strong>اسم العمل:</strong> ${job.businessName}</p>
                    <p><strong>وصف الوظيفة:</strong> ${job.jobDescription}</p>
                    ${whatsappLink}
                `;
                jobsContainer.appendChild(jobDiv);
            });
        }

        // Load user jobs
        function loadUserJobs() {
            const user = auth.currentUser;
            if (!user) return;
            const jobs = JSON.parse(localStorage.getItem('jobs')) || [];
            const userJobs = jobs.filter(job => job.userId === user.uid);
            userJobsContainer.innerHTML = '';
            userJobs.forEach((job) => {
                const jobDiv = document.createElement('div');
                jobDiv.classList.add('job');
                const whatsappLink = `<a href="https://wa.me/${localStorage.getItem(`userPhone_${user.uid}`) || ''}" class="whatsapp-link" target="_blank">تواصل عبر واتساب</a>`;
                jobDiv.innerHTML = `
                    <h3>${job.jobTitle}</h3>
                    <p><strong>اسم العمل:</strong> ${job.businessName}</p>
                    <p><strong>وصف الوظيفة:</strong> ${job.jobDescription}</p>
                    ${whatsappLink}
                `;
                userJobsContainer.appendChild(jobDiv);
            });
        }

        // Save job to localStorage
        function saveJob(job) {
            const jobs = JSON.parse(localStorage.getItem('jobs')) || [];
            jobs.push(job);
            localStorage.setItem('jobs', JSON.stringify(jobs));
        }

        // Load jobs from localStorage
        function loadJobs() {
            const jobs = JSON.parse(localStorage.getItem('jobs')) || [];
            jobsContainer.innerHTML = '';
            jobs.forEach((job) => {
                const jobDiv = document.createElement('div');
                jobDiv.classList.add('job');
                const whatsappLink = `<a href="https://wa.me/${job.userPhone || ''}" class="whatsapp-link" target="_blank">تواصل عبر واتساب</a>`;
                jobDiv.innerHTML = `
                    <h3>${job.jobTitle}</h3>
                    <p><strong>اسم العمل:</strong> ${job.businessName}</p>
                    <p><strong>وصف الوظيفة:</strong> ${job.jobDescription}</p>
                    ${whatsappLink}
                `;
                jobsContainer.appendChild(jobDiv);
            });
        }

        // Load user jobs
        function loadUserJobs() {
            const user = auth.currentUser;
            if (!user) return;
            const jobs = JSON.parse(localStorage.getItem('jobs')) || [];
            const userJobs = jobs.filter(job => job.userId === user.uid);
            userJobsContainer.innerHTML = '';
            userJobs.forEach((job) => {
                const jobDiv = document.createElement('div');
                jobDiv.classList.add('job');
                const whatsappLink = `<a href="https://wa.me/${localStorage.getItem(`userPhone_${user.uid}`) || ''}" class="whatsapp-link" target="_blank">تواصل عبر واتساب</a>`;
                jobDiv.innerHTML = `
                    <h3>${job.jobTitle}</h3>
                    <p><strong>اسم العمل:</strong> ${job.businessName}</p>
                    <p><strong>وصف الوظيفة:</strong> ${job.jobDescription}</p>
                    ${whatsappLink}
                `;
                userJobsContainer.appendChild(jobDiv);
            });
        }

        // Save job to localStorage
        function saveJob(job) {
            const jobs = JSON.parse(localStorage.getItem('jobs')) || [];
            jobs.push(job);
            localStorage.setItem('jobs', JSON.stringify(jobs));
        }

        // Login
        document.getElementById('login').addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('login-email').value.trim();
            const password = document.getElementById('login-password').value.trim();
            try {
                await signInWithEmailAndPassword(auth, email, password);
                document.getElementById('login').reset();
            } catch (error) {
                alert('بيانات غير صحيحة');
            }
        });

        // Register
        document.getElementById('register').addEventListener('submit', async (e) => {
            e.preventDefault();
            const name = document.getElementById('reg-name').value.trim();
            const email = document.getElementById('reg-email').value.trim();
            const password = document.getElementById('reg-password').value.trim();
            try {
                const userCredential = await createUserWithEmailAndPassword(auth, email, password);
                const user = userCredential.user;
                localStorage.setItem(`userName_${user.uid}`, name);
                document.getElementById('register').reset();
            } catch (error) {
                alert('خطأ في التسجيل: ' + error.message);
            }
        });

        // Logout
        logoutBtn.addEventListener('click', async () => {
            try {
                await signOut(auth);
            } catch (error) {
                console.error('Logout error:', error);
            }
        });

        // Show login
        loginBtn.addEventListener('click', () => {
            authSection.style.display = 'block';
            loginFormDiv.style.display = 'block';
            registerFormDiv.style.display = 'none';
        });

        // Show register
        registerBtn.addEventListener('click', () => {
            authSection.style.display = 'block';
            loginFormDiv.style.display = 'none';
            registerFormDiv.style.display = 'block';
        });

        // Show dashboard
        dashboardBtn.addEventListener('click', () => {
            loadUserJobs();
            dashboardSection.style.display = 'block';
            postJobSection.style.display = 'none';
        });

        // Job form submit
        jobForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const user = auth.currentUser;
            if (!user) return;
            const businessName = document.getElementById('business-name').value.trim();
            const jobTitle = document.getElementById('job-title').value.trim();
            const jobDescription = document.getElementById('job-description').value.trim();
            if (businessName && jobTitle && jobDescription) {
                const newJob = {
                    businessName,
                    jobTitle,
                    jobDescription,
                    userId: user.uid,
                    userName: localStorage.getItem(`userName_${user.uid}`) || user.email
                };
                saveJob(newJob);
                loadJobs();
                jobForm.reset();
            }
        });

    }, 1000); // Wait 1 second for Firebase to load
});
