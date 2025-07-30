document.getElementById('feedbackForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const data = {
        message: formData.get('message'),
        category: formData.get('category')
    };
    
    if (formData.get('rating')) {
        data.rating = parseInt(formData.get('rating'));
    }
    
    try {
        const response = await fetch('/api/feedback/submit', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        
        const result = await response.json();
        const resultDiv = document.getElementById('result');
        
        if (result.success) {
            resultDiv.className = 'result success';
            resultDiv.innerHTML = `<strong>Success!</strong> ${result.message}`;
            e.target.reset();
        } else {
            resultDiv.className = 'result error';
            resultDiv.innerHTML = `<strong>Error:</strong> ${result.message}`;
        }
    } catch (error) {
        document.getElementById('result').innerHTML = `<div class="result error"><strong>Error:</strong> ${error.message}</div>`;
    }
});