/**
 * Main PollApp class that manages the entire polling application
 * Handles poll creation, voting, real-time updates, and chart visualization
 */
class PollApp {
    /**
     * Constructor initializes the app with empty data structures
     * - polls: Array to store all active polls
     * - userVotes: Map to track which polls user has voted on
     * - charts: Map to store Chart.js instances for each poll
     */
    constructor() {
        this.polls = [];                // Store all active polls
        this.userVotes = new Map();     // Track user votes to prevent duplicate voting
        this.charts = new Map();        // Store chart instances for real-time updates
        this.socket = io();             // Initialize socket connection
        this.init();
    }

    /**
     * Initialize the application by setting up event listeners and socket listeners
     */
    init() {
        this.setupEventListeners();
        this.setupSocketListeners();
    }

    /**
     * Set up event listeners for form submission
     * Binds the poll creation form to handleCreatePoll method
     */
    setupEventListeners() {
        const pollForm = document.getElementById('pollForm');
        pollForm.addEventListener('submit', (e) => this.handleCreatePoll(e));
    }

    /**
     * Handle poll creation form submission
     * Validates input, creates poll object, and adds it to the app
     * @param {Event} e - Form submission event
     */
    handleCreatePoll(e) {
        e.preventDefault(); // Prevent default form submission
        
        // Extract form data
        const question = document.getElementById('pollQuestion').value.trim();
        const options = [
            document.getElementById('option1').value.trim(),
            document.getElementById('option2').value.trim(),
            document.getElementById('option3').value.trim(),
            document.getElementById('option4').value.trim()
        ];

        // Validate that question and all options are filled
        if (question && options.every(option => option)) {
            // Create poll object with unique ID and initial vote counts
            const poll = {
                id: Date.now().toString(),  // Use timestamp as unique ID
                question,
                options: options.map((text, index) => ({
                    id: index,
                    text,
                    votes: 0    // Initialize with zero votes
                })),
                totalVotes: 0,
                createdAt: new Date()
            };

            this.resetForm();
            this.emitCreatePoll(poll);
        }
    }

    /**
     * Add a new poll to the application
     * Stores poll in array and renders it to the DOM
     * @param {Object} poll - Poll object containing question, options, and metadata
     */
    addPoll(poll) {
        this.polls.push(poll);      // Add to polls array
        this.renderPoll(poll);      // Render to DOM
    }

    /**
     * Render a poll to the DOM with all its components
     * Creates HTML structure for poll question, options, chart, and statistics
     * @param {Object} poll - Poll object to render
     */
    renderPoll(poll) {
        const pollsContainer = document.getElementById('pollsContainer');
        const pollCard = document.createElement('div');
        pollCard.className = 'poll-card';
        pollCard.id = `poll-${poll.id}`;

        // Create HTML structure with poll question, voting options, chart canvas, and stats
        pollCard.innerHTML = `
            <h3 class="poll-question">${poll.question}</h3>
            <div class="poll-options" id="options-${poll.id}">
                ${poll.options.map(option => `
                    <div class="option-button" data-poll-id="${poll.id}" data-option-id="${option.id}">
                        ${option.text}
                    </div>
                `).join('')}
            </div>
            <div class="chart-container">
                <canvas id="chart-${poll.id}"></canvas>
            </div>
            <div class="poll-stats" id="stats-${poll.id}">
                ${poll.options.map(option => `
                    <div class="stat-item">
                        <div class="stat-label">${option.text}</div>
                        <div class="stat-value">${option.votes}</div>
                        <div class="stat-percentage">0%</div>
                    </div>
                `).join('')}
            </div>
        `;

        // Add poll card to container and set up interactivity
        pollsContainer.appendChild(pollCard);
        this.setupPollEventListeners(poll.id);  // Make options clickable
        this.createChart(poll);                  // Initialize chart visualization
    }

    /**
     * Set up click event listeners for poll option buttons
     * Each option button becomes clickable for voting
     * @param {string} pollId - ID of the poll to set up listeners for
     */
    setupPollEventListeners(pollId) {
        const optionButtons = document.querySelectorAll(`[data-poll-id="${pollId}"]`);
        optionButtons.forEach(button => {
            button.addEventListener('click', () => {
                const optionId = parseInt(button.dataset.optionId);
                this.handleVote(pollId, optionId);
            });
        });
    }

    /**
     * Handle user voting on a poll option
     * Prevents duplicate voting and updates poll data and UI
     * @param {string} pollId - ID of the poll being voted on
     * @param {number} optionId - ID of the selected option
     */
    handleVote(pollId, optionId) {
        // Check if user already voted on this poll
        if (this.userVotes.has(pollId)) {
            return; // Prevent duplicate voting
        }

        // Find the poll in our data
        const poll = this.polls.find(p => p.id === pollId);
        if (!poll) return;

        // Update vote counts
        poll.options[optionId].votes++;    // Increment selected option votes
        poll.totalVotes++;                 // Increment total votes
        this.userVotes.set(pollId, optionId); // Record user's vote

        // Update the visual display
        this.updatePollDisplay(poll);       // Update chart and stats
        this.markUserVote(pollId, optionId); // Mark user's choice visually

        // Emit vote to server
        this.emitVote(pollId, optionId);
    }

    /**
     * Update both chart and statistics display for a poll
     * Called after vote changes to refresh visual data
     * @param {Object} poll - Poll object with updated vote data
     */
    updatePollDisplay(poll) {
        this.updateChart(poll);  // Update doughnut chart
        this.updateStats(poll);  // Update numerical statistics
    }

    /**
     * Create a Chart.js doughnut chart for poll visualization
     * Sets up initial chart with colors, labels, and responsive options
     * @param {Object} poll - Poll object to create chart for
     */
    createChart(poll) {
        const ctx = document.getElementById(`chart-${poll.id}`).getContext('2d');
        const chart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: poll.options.map(option => option.text),  // Option names as labels
                datasets: [{
                    data: poll.options.map(option => option.votes), // Vote counts as data
                    backgroundColor: [  // Different color for each option
                        '#FF6384',  // Pink
                        '#36A2EB',  // Blue
                        '#FFCE56',  // Yellow
                        '#4BC0C0'   // Teal
                    ],
                    borderWidth: 2,
                    borderColor: '#fff'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            padding: 20,
                            usePointStyle: true
                        }
                    }
                }
            }
        });
        this.charts.set(poll.id, chart);  // Store chart instance for updates
    }

    /**
     * Update existing chart with new vote data
     * Refreshes chart visualization in real-time after votes
     * @param {Object} poll - Poll object with updated vote counts
     */
    updateChart(poll) {
        const chart = this.charts.get(poll.id);
        if (chart) {
            // Update chart data with new vote counts
            chart.data.datasets[0].data = poll.options.map(option => option.votes);
            chart.update('active');  // Animate the update
        }
    }

    /**
     * Update numerical statistics display (vote counts and percentages)
     * Calculates and displays current vote counts and percentages for each option
     * @param {Object} poll - Poll object with current vote data
     */
    updateStats(poll) {
        const statsContainer = document.getElementById(`stats-${poll.id}`);
        const statItems = statsContainer.querySelectorAll('.stat-item');
        
        statItems.forEach((item, index) => {
            const option = poll.options[index];
            // Calculate percentage (avoid division by zero)
            const percentage = poll.totalVotes > 0 ? 
                Math.round((option.votes / poll.totalVotes) * 100) : 0;
            
            // Update DOM elements with new values
            item.querySelector('.stat-value').textContent = option.votes;
            item.querySelector('.stat-percentage').textContent = `${percentage}%`;
        });
    }

    /**
     * Mark user's vote visually and disable further voting
     * Highlights the selected option and disables all option buttons
     * @param {string} pollId - ID of the poll that was voted on
     * @param {number} optionId - ID of the option that was selected
     */
    markUserVote(pollId, optionId) {
        const optionButtons = document.querySelectorAll(`[data-poll-id="${pollId}"]`);
        optionButtons.forEach((button, index) => {
            if (index === optionId) {
                button.classList.add('voted');  // Highlight selected option
            }
            button.style.pointerEvents = 'none';  // Disable all buttons
        });
    }

    /**
     * Reset the poll creation form to empty state
     * Clears all input fields after successful poll creation
     */
    resetForm() {
        document.getElementById('pollForm').reset();
    }

    /**
     * Set up socket event listeners for real-time communication
     */
    setupSocketListeners() {
        // Listen for existing polls when connecting
        this.socket.on('existingPolls', (polls) => {
            polls.forEach(poll => this.addPoll(poll));
        });
        
        // Listen for new polls from other users
        this.socket.on('newPoll', (poll) => {
            this.onNewPoll(poll);
        });
        
        // Listen for poll updates (votes)
        this.socket.on('pollUpdate', (updatedPoll) => {
            this.onPollUpdate(updatedPoll);
        });
    }

    // ========== SOCKET.IO INTEGRATION METHODS ==========
    // These methods will handle real-time communication with the server

    /**
     * Handle incoming new poll from socket
     * Called when another user creates a poll
     * @param {Object} poll - New poll object received from server
     */
    onNewPoll(poll) {
        // Only add if we don't already have this poll
        if (!this.polls.find(p => p.id === poll.id)) {
            this.addPoll(poll);
        }
    }

    /**
     * Handle poll updates from socket (when someone votes)
     * Updates existing poll with new vote data from server
     * @param {Object} updatedPoll - Poll object with updated vote counts
     */
    onPollUpdate(updatedPoll) {
        const pollIndex = this.polls.findIndex(p => p.id === updatedPoll.id);
        if (pollIndex !== -1) {
            this.polls[pollIndex] = updatedPoll;      // Update local data
            this.updatePollDisplay(updatedPoll);      // Refresh UI
        }
    }

    /**
     * Emit poll creation to server via socket
     * Will broadcast new poll to all connected users
     * @param {Object} poll - Poll object to send to server
     */
    emitCreatePoll(poll) {
        this.socket.emit('createPoll', poll);
        console.log('Creating poll:', poll);
    }

    /**
     * Emit vote to server via socket
     * Will update poll data for all connected users
     * @param {string} pollId - ID of poll being voted on
     * @param {number} optionId - ID of selected option
     */
    emitVote(pollId, optionId) {
        this.socket.emit('vote', { pollId, optionId });
        console.log('Voting:', { pollId, optionId });
    }
}

// ========== APP INITIALIZATION ==========
// Initialize the polling app when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    window.pollApp = new PollApp();
});