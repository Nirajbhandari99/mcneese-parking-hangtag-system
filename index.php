<!-- 
        Author:Niraj Bhandari
        -->
<!DOCTYPE html>
<html lang="en">
<head>
    <!-- 
    HEAD SECTION
    Contains meta information and links to resources
    -->
    
    <!-- Character encoding for proper text display (supports all languages) -->
    <meta charset="UTF-8">
    
    <!-- 
    Viewport settings for mobile responsiveness
    Makes the website adapt to different screen sizes
    width=device-width: matches screen width
    initial-scale=1.0: normal zoom level
    -->
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    
    <!-- Page title that appears in browser tab and search results -->
    <title>McNeese State University - Parking Services</title>
    
    <!-- Link to external CSS file for all styling and layout -->
    <link rel="stylesheet" href="styles.css">
</head>
<body>
    <!-- 
    /====
    HEADER SECTION
    The top bar of the website with logo and navigation
    Stays consistent across all pages for easy navigation

    -->
    <header class="header">
        <div class="container">
            <!-- 
            LOGO AREA
            Contains university branding elements
            Combines image logo with text for brand recognition
            -->
            <div class="logo">
                <!-- 
                Logo icon container
                Note: There's a duplicate div here that should be cleaned up
                Currently displays the McNeese logo image
                width="100" and height="50" set the image dimensions
                -->
                <div class="logo-icon">
                    <div class="logo-icon">
                        <img src="download.png" alt="A description of the image" width="100" height="50">
                    </div>
                </div>
                
                <!-- 
                Text branding next to the logo
                University name and department name for clarity
                -->
                <div class="logo-text">
                    <h1>McNeese State University</h1>
                    <p>Parking Services</p>
                </div>
            </div>
            
            <!-- 
            MAIN NAVIGATION MENU
            Provides links to key pages on the site
            Simple two-link navigation for homepage
            -->
            <nav class="nav">
                <!-- Link to learn more about parking services -->
                <a href="about.html" class="nav-link">About</a>
                
                <!-- Login button styled differently to stand out -->
                <a href="login.html" class="btn-logout">Login</a>
            </nav>
        </div>
    </header>

    <!-- 
    /====
    HERO SECTION
    The main banner area that grabs visitor attention
    Features background image, headline, and parking options
    This is the first thing visitors see when they land on the page
    /====
    -->
    <section class="hero">
        <!-- 
        DARK OVERLAY
        Semi-transparent dark layer placed over the background image
        Makes white text readable and creates professional look
        Without this overlay, text would be hard to read on busy backgrounds
        -->
        <div class="hero-overlay"></div>
        
        <!-- 
        HERO CONTENT CONTAINER
        All the text and interactive elements on top of the background
        Positioned to be centered and prominent
        -->
        <div class="hero-content">
            <!-- 
            MAIN HEADLINE
            Primary message telling users what they can do here
            Large, bold text to immediately communicate purpose
            -->
            <h2 class="hero-title">Purchase Your Parking Hang Tag</h2>
            
            <!-- 
            SUBTITLE
            Supporting text that provides additional context
            Encourages users to explore parking options
            -->
            <p class="hero-subtitle">Here are the parking type and complete your purchase online.</p>
            
            <!-- 
            /====
            PARKING TYPE CARDS
            Three cards displaying different parking categories
            Each card has an icon, title, and description
            Helps users quickly identify which type applies to them
            /====
            -->
            <div class="parking-types">
                <!-- 
                VISITOR PARKING CARD
                For people visiting the campus temporarily
                Icon: 👥 (two people) represents visitors
                -->
                <div class="parking-card">
                    <div class="card-icon">👥</div>
                    <h3>Visitor</h3>
                    <p>Short-term parking for campus visitors</p>
                </div>
                
                <!-- 
                STUDENT PARKING CARD
                For enrolled students who need regular parking access
                Icon: 🎓 (graduation cap) represents students
                Most common parking type
                -->
                <div class="parking-card">
                    <div class="card-icon">🎓</div>
                    <h3>Student</h3>
                    <p>Annual parking passes for enrolled students</p>
                </div>
                
                <!-- 
                FACULTY/STAFF PARKING CARD
                Reserved parking for university employees
                Icon: 👨‍🏫 (teacher) represents faculty and staff
                Often has special privileges or reserved spots
                -->
                <div class="parking-card">
                    <div class="card-icon">👨‍🏫</div>
                    <h3>Faculty</h3>
                    <p>Reserved parking for faculty and staff</p>
                </div>
            </div>
            
            <!-- 
            CALL-TO-ACTION BUTTON
            Primary action button that starts the purchase process
            Clicking redirects user to login page
            Prominent placement encourages users to take action
            Uses JavaScript onclick to navigate to login.html
            -->
            <button class="btn-purchase" onclick="window.location.href='login.html'">Purchase Now</button>
        </div>
    </section>

    <!-- 
    /====
    HOW IT WORKS SECTION
    Educational section explaining the purchase process
    Breaks down what might seem complicated into 3 simple steps
    Reduces user confusion and increases conversion
    /====
    -->
    <section class="how-it-works">
        <div class="container">
            <!-- 
            SECTION HEADER
            Title that introduces the step-by-step guide
            -->
            <h2 class="section-title">How It Works</h2>
            
            <!-- 
            SECTION SUBTITLE
            Brief description of what users will learn
            Sets expectations for the content below
            -->
            <p class="section-subtitle">Simple steps to get your parking tag</p>
            
            <!-- 
            /====
            STEP-BY-STEP PROCESS
            Three columns showing the complete workflow
            Each step is numbered and explained clearly
            Visual flow from left to right guides users
            /====
            -->
            <div class="steps">
                <!-- 
                STEP 1: SELECT PARKING TYPE
                First action user needs to take
                Choose from Visitor, Student, or Faculty
                -->
                <div class="step">
                    <!-- Large numbered circle for visual hierarchy -->
                    <div class="step-number">1</div>
                    
                    <!-- Step title (short and action-oriented) -->
                    <h3>Select Type</h3>
                    
                    <!-- Detailed explanation of this step -->
                    <p>Choose your parking category: Visitor, Student, or Faculty based on your status</p>
                </div>
                
                <!-- 
                STEP 2: ENTER INFORMATION
                Second action in the process
                Users provide personal and vehicle details
                This data is needed for tag registration
                -->
                <div class="step">
                    <!-- Step number indicator -->
                    <div class="step-number">2</div>
                    
                    <!-- Step title -->
                    <h3>Fill Info</h3>
                    
                    <!-- Explanation of what information is needed -->
                    <p>Provide your personal details and vehicle information for tag registration</p>
                </div>
                
                <!-- 
                STEP 3: COMPLETE PAYMENT
                Final step in the process
                Secure online payment to finalize purchase
                After this, user receives their parking tag info
                -->
                <div class="step">
                    <!-- Step number indicator -->
                    <div class="step-number">3</div>
                    
                    <!-- Step title -->
                    <h3>Pay Online</h3>
                    
                    <!-- Reassures users about security and outcome -->
                    <p>Complete your purchase securely online and receive your tag information</p>
                </div>
            </div>
        </div>
        
        <!-- 
        /====
        INLINE STYLES
        CSS specifically for this page
        Note: Normally styles should be in external CSS file
        /====
        -->
        <style>
            /* 
            HERO BACKGROUND IMAGE
            Sets the main banner background image
            This creates the visual impact in the hero section
            The image shows parking or campus scene
            */
            .hero {
                /* Path to the background image file */
                background-image: url('download1.jpg.webp');
                /* 
                Additional properties like background-size, background-position
                are likely defined in the external styles.css file
                */
            }
        </style>
    </section>

    <!-- 
    /====
    FOOTER SECTION
    Bottom of the page with important information
    Appears on every page for consistency
    Contains contact details, hours, and helpful links
    /====
    -->
    <footer class="footer">
        <!-- 
        FOOTER CONTENT CONTAINER
        Organizes footer into three columns
        Each column serves a different purpose
        -->
        <div class="container footer-content">
            <!-- 
            COLUMN 1: CONTACT INFORMATION
            How to reach parking services
            Provides multiple contact methods (phone, email, physical address)
            Emoji icons make information scannable
            -->
            <div class="footer-section">
                <h3>Contact Information</h3>
                
                <!-- Phone number for calling parking services -->
                <p>📞 (337) 475-5000</p>
                
                <!-- Email address for written inquiries -->
                <p>✉️ parking@mcneese.edu</p>
                
                <!-- 
                Physical address for in-person visits
                Uses <br> tag to split address across two lines for readability
                -->
                <p>📍 4205 Ryan St.<br>Lake Charles, LA 70609</p>
            </div>
            
            <!-- 
            COLUMN 2: OFFICE HOURS
            When the parking office is open
            Helps users know when they can visit or call
            Shows different hours for different days
            -->
            <div class="footer-section">
                <h3>Office Hours</h3>
                
                <!-- Weekday hours (most common visiting time) -->
                <p>Monday – Friday: 8:00 AM – 5:00 PM</p>
                
                <!-- Saturday hours (limited availability) -->
                <p>Saturday: 9:00 AM – 1:00 PM</p>
                
                <!-- Sunday (office closed) -->
                <p>Sunday: Closed</p>
            </div>
            
            <!-- 
            COLUMN 3: QUICK LINKS
            Important resources users might need
            Links to rules, appeals, and common questions
            Currently using placeholder "#" links
            -->
            <div class="footer-section">
                <h3>Quick Links</h3>
                
                <!-- Link to parking rules and regulations -->
                <p><a href="#" class="footer-link">Parking Regulations</a></p>
                
                <!-- Link to appeal parking tickets -->
                <p><a href="#" class="footer-link">Appeal Process</a></p>
                
                <!-- Link to frequently asked questions -->
                <p><a href="#" class="footer-link">FAQ</a></p>
            </div>
        </div>
        
        <!-- 
        COPYRIGHT BAR
        Legal notice at very bottom of page
        Shows copyright year and organization name
        Standard practice for all websites
        -->
        <div class="footer-bottom">
            <p>© 2025 McNeese State University. All rights reserved.</p>
        </div>
    </footer>
</body>
</html>