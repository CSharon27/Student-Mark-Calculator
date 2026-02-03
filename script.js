document.addEventListener('DOMContentLoaded', () => {

    // ----------------------------
    // Navigation & Mobile Menu
    // ----------------------------
    const mobileMenu = document.getElementById('mobile-menu');
    const navMenu = document.querySelector('.nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');

    // Toggle Mobile Menu
    mobileMenu.addEventListener('click', () => {
        mobileMenu.classList.toggle('active');
        navMenu.classList.toggle('active');
    });

    // Close Menu when clicking a link
    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            mobileMenu.classList.remove('active');
            navMenu.classList.remove('active');
        });
    });

    // Sticky Navbar shadow on scroll
    window.addEventListener('scroll', () => {
        const navbar = document.getElementById('navbar');
        if (window.scrollY > 50) {
            navbar.style.boxShadow = "0 4px 20px rgba(0,0,0,0.1)";
        } else {
            navbar.style.boxShadow = "0 2px 10px rgba(0,0,0,0.05)";
        }
    });

    // ----------------------------
    // Calculator Logic
    // ----------------------------
    const marksForm = document.getElementById('marksForm');
    const resetBtn = document.getElementById('resetBtn');
    const validationMsg = document.getElementById('validationMsg');

    // Dynamic Fields
    const subjectsContainer = document.getElementById('subjectsContainer');
    const addSubjectBtn = document.getElementById('addSubjectBtn');

    // Mode Toggles & Inputs
    const modeCheck = document.getElementById('modeCheck'); // unchecked=School, checked=College
    const schoolLabel = document.querySelector('.school-label');
    const collegeLabel = document.querySelector('.college-label');
    const subjectsHeader = document.querySelector('.subjects-header'); // For grid layout class

    // CGPA Inputs
    const calcCgpaCheck = document.getElementById('calcCgpaCheck');
    const cgpaInputs = document.getElementById('cgpaInputs');
    const cgpaSection = document.querySelector('.cgpa-toggle-section'); // To hide entirely in School mode

    // Result Display Elements
    const resultCard = document.getElementById('resultCard');
    const placeholderCard = document.getElementById('placeholderCard');
    const resName = document.getElementById('resName');
    const resRoll = document.getElementById('resRoll');
    const resTotal = document.getElementById('resTotal');
    const resAvg = document.getElementById('resAvg');
    const resPerc = document.getElementById('resPerc');
    const resGrade = document.getElementById('resGrade');
    const resStatus = document.getElementById('resStatus');
    const resRemark = document.getElementById('resRemark');

    const resGpa = document.getElementById('resGpa');
    const resCgpa = document.getElementById('resCgpa');
    const boxCgpa = document.getElementById('boxCgpa');
    const gpaStatsContainer = document.querySelector('.gpa-stats'); // To hide entirely

    // Initialize
    updateModeUI(); // Set initial state (School Mode)

    // Initialize with 5 subjects
    for (let i = 0; i < 5; i++) {
        addSubjectRow();
    }

    // Event Listeners
    addSubjectBtn.addEventListener('click', addSubjectRow);

    modeCheck.addEventListener('change', () => {
        updateModeUI();
        // Clear results on mode switch
        placeholderCard.style.display = 'flex';
        resultCard.style.display = 'none';
        validationMsg.textContent = '';
    });

    calcCgpaCheck.addEventListener('change', () => {
        cgpaInputs.style.display = calcCgpaCheck.checked ? 'block' : 'none';
        boxCgpa.style.display = calcCgpaCheck.checked ? 'block' : 'none';

        if (resultCard.style.display === 'block') {
            boxCgpa.style.display = calcCgpaCheck.checked ? 'block' : 'none';
        }
    });

    marksForm.addEventListener('submit', (e) => {
        e.preventDefault();

        if (calculateResult()) {
            placeholderCard.style.display = 'none';
            resultCard.style.display = 'block';
            resultCard.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    });

    resetBtn.addEventListener('click', () => {
        const wasCollege = modeCheck.checked; // Capture current mode
        marksForm.reset();
        modeCheck.checked = wasCollege; // Restore mode

        // Reset subjects to 5
        subjectsContainer.innerHTML = '';
        for (let i = 0; i < 5; i++) addSubjectRow();

        updateModeUI(); // Re-apply mode settings

        cgpaInputs.style.display = 'none';
        placeholderCard.style.display = 'flex';
        resultCard.style.display = 'none';
        validationMsg.textContent = '';
    });

    function updateModeUI() {
        const isCollege = modeCheck.checked;

        // Toggle Labels
        if (isCollege) {
            schoolLabel.classList.remove('active');
            collegeLabel.classList.add('active');

            // Show College Elements
            document.querySelectorAll('.college-only').forEach(el => el.style.display = 'block');
            cgpaSection.style.display = 'block';

            // Grid Layouts
            subjectsHeader.classList.add('college-mode');
            document.querySelectorAll('.subject-row').forEach(row => {
                row.classList.add('college-mode');
                row.querySelector('.credit-input').style.display = 'block';
            });

        } else {
            schoolLabel.classList.add('active');
            collegeLabel.classList.remove('active');

            // Hide College Elements
            document.querySelectorAll('.college-only').forEach(el => el.style.display = 'none');
            cgpaSection.style.display = 'none';

            // Grid Layouts
            subjectsHeader.classList.remove('college-mode');
            document.querySelectorAll('.subject-row').forEach(row => {
                row.classList.remove('college-mode');
                row.querySelector('.credit-input').style.display = 'none';
            });
        }
    }

    function addSubjectRow() {
        const rowId = Date.now() + Math.random();
        const row = document.createElement('div');
        row.className = 'subject-row';
        if (modeCheck.checked) row.classList.add('college-mode'); // Init with correct mode
        row.dataset.id = rowId;

        // Determine style for credit input based on mode
        const creditStyle = modeCheck.checked ? 'display: block;' : 'display: none;';

        row.innerHTML = `
            <input type="text" placeholder="Subject Name (Optional)">
            <input type="number" class="mark-input" min="0" max="100" placeholder="Marks (0-100)" required>
            <input type="number" class="credit-input" min="1" max="10" value="4" placeholder="Credits" style="${creditStyle}">
            <button type="button" class="btn-remove" onclick="removeRow(this)"><i class="fas fa-trash"></i></button>
        `;

        subjectsContainer.appendChild(row);
    }

    // Global function for onclick attribute
    window.removeRow = function (btn) {
        if (subjectsContainer.children.length > 1) {
            btn.parentElement.remove();
        } else {
            alert("Min 1 subject required.");
        }
    };

    function calculateResult() {
        const isCollege = modeCheck.checked;

        // Get Input Values
        const name = document.getElementById('studentName').value.trim();
        const roll = document.getElementById('rollNumber').value.trim();

        // Get Rows
        const rows = document.querySelectorAll('.subject-row');
        let totalMarks = 0;
        let totalMaxMarks = rows.length * 100;
        let totalCredits = 0;
        let weightedPoints = 0;
        let isPass = true;

        // 1. Validation & Calculation Loop
        for (let row of rows) {
            const markInput = row.querySelector('.mark-input');
            const marks = parseFloat(markInput.value);

            if (isNaN(marks) || marks < 0 || marks > 100) {
                validationMsg.textContent = `Error: Marks must be between 0 and 100.`;
                return false;
            }

            totalMarks += marks;

            // Check Pass
            if (marks < 35) isPass = false;

            // College Logic (Credits & Grade Points)
            if (isCollege) {
                const creditInput = row.querySelector('.credit-input');
                const credits = parseFloat(creditInput.value) || 1;
                totalCredits += credits;

                let gp = 0;
                if (marks >= 90) gp = 10;
                else if (marks >= 80) gp = 9;
                else if (marks >= 70) gp = 8;
                else if (marks >= 60) gp = 7;
                else if (marks >= 50) gp = 6;
                else if (marks >= 40) gp = 5;
                else gp = 0;

                weightedPoints += (gp * credits);
            }
        }

        validationMsg.textContent = ''; // Clear error if valid

        // 2. Metrics
        const average = totalMarks / rows.length;
        const percentage = (totalMarks / totalMaxMarks) * 100;

        // 3. GPA/CGPA Logic (College Only)
        let gpa = 0;
        let cgpa = 0;

        if (isCollege) {
            gpa = totalCredits > 0 ? (weightedPoints / totalCredits) : 0;
            cgpa = gpa;

            if (calcCgpaCheck.checked) {
                const prevCgpa = parseFloat(document.getElementById('prevCgpa').value);
                const prevCredits = parseFloat(document.getElementById('prevCredits').value);

                if (!isNaN(prevCgpa) && !isNaN(prevCredits)) {
                    const totalPrevPoints = prevCgpa * prevCredits;
                    const grandTotalPoints = totalPrevPoints + weightedPoints;
                    const grandTotalCredits = prevCredits + totalCredits;
                    cgpa = grandTotalCredits > 0 ? (grandTotalPoints / grandTotalCredits) : 0;
                }
            }
        }

        // 4. Final Grade Logic
        let grade = 'F';
        let remark = 'Needs Improvement';

        if (isPass) {
            if (percentage >= 90) { grade = 'A+'; remark = 'Outstanding Performance!'; }
            else if (percentage >= 80) { grade = 'A'; remark = 'Excellent Work!'; }
            else if (percentage >= 70) { grade = 'B'; remark = 'Good Job!'; }
            else if (percentage >= 60) { grade = 'C'; remark = 'Fair Performance.'; }
            else if (percentage >= 50) { grade = 'D'; remark = 'Can Do Better.'; }
            else { grade = 'F'; remark = 'Failed.'; }
        } else {
            grade = 'F';
            remark = 'Better Luck Next Time.';
        }

        // 5. Update UI
        resName.textContent = name;
        resRoll.textContent = `Roll No: ${roll}`;

        animateValue(resTotal, 0, totalMarks, 1000);
        resTotal.textContent = `${totalMarks} / ${totalMaxMarks}`;

        resAvg.textContent = average.toFixed(2);
        resPerc.textContent = `${percentage.toFixed(2)}%`;

        resGrade.textContent = grade;

        // Hide/Show GPA Stats based on Mode
        if (isCollege) {
            gpaStatsContainer.style.display = 'flex';
            resGpa.textContent = gpa.toFixed(2);
            resCgpa.textContent = cgpa.toFixed(2);

            // Ensure CGPA box visibility logic is respected (only if checkbox checked)
            if (!calcCgpaCheck.checked) boxCgpa.style.display = 'none';
            else boxCgpa.style.display = 'block';

        } else {
            gpaStatsContainer.style.display = 'none';
        }

        if (isPass && grade !== 'F') {
            resStatus.textContent = 'PASS';
            resStatus.classList.remove('status-fail');
            resStatus.classList.add('status-pass');
            resGrade.style.color = 'var(--success)';
        } else {
            resStatus.textContent = 'FAIL';
            resStatus.classList.remove('status-pass');
            resStatus.classList.add('status-fail');
            resGrade.style.color = 'var(--danger)';
        }

        resRemark.textContent = remark;

        return true;
    }

    // Number Animation Helper (Simple version)
    function animateValue(obj, start, end, duration) {
        // ... (Animation logic same as before, simplified for brevity here if needed)
        // Re-using existing animation logic if it was robust, else here is simple:
    }
});
