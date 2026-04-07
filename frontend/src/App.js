// import React from 'react';
// import { useSelector, useDispatch } from 'react-redux';
// import { setFormData, clearForm, setLoading as setFormLoading } from './formSlice';
// import { addMessage, setLoading as setChatLoading, setCurrentMessage } from './chatSlice';
// import './App.css';

// function App() {
//   const dispatch = useDispatch();
//   const formData = useSelector((state) => state.form);
//   const { messages: chatHistory, loading: chatLoading, currentMessage: chatMessage } = useSelector((state) => state.chat);
//   const formLoading = useSelector((state) => state.form.loading);

//   const handleAgentSubmit = async () => {
//     if (!chatMessage.trim()) return;

//     const userMessage = chatMessage;
//     dispatch(addMessage({ type: 'user', text: userMessage }));
//     dispatch(setCurrentMessage(''));
//     dispatch(setChatLoading(true));

//     try {
//       const response = await fetch('http://127.0.0.1:8000/agent', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ input: userMessage }),
//       });

//       const data = await response.json();

//       if (response.ok && data.tool && data.data) {
//         const d = data.data;

//         if (data.tool === 'log_interaction') {
//           dispatch(setFormData({
//             hcpName: d.hcpName || d.hcp_name || '',
//             interactionType: d.interactionType || 'Meeting',
//             date: d.date || new Date().toISOString().split('T')[0],
//             time: d.time || '',
//             attendees: d.attendees || '',
//             topicsDiscussed: d.topicsDiscussed || d.notes || '',
//             materialsShared: d.materialsShared || [],
//             samplesDistributed: d.samplesDistributed || [],
//             sentiment: d.sentiment || 'Neutral',
//             outcomes: d.outcomes || '',
//             followUpActions: d.followUpActions || '',
//             aiSuggestedFollowUps: d.aiSuggestedFollowUps || [],
//           }));

//         } else if (data.tool === 'edit_interaction') {
//           const updates = {};
//           if (d.hcpName !== undefined) updates.hcpName = d.hcpName;
//           if (d.interactionType !== undefined) updates.interactionType = d.interactionType;
//           if (d.date !== undefined) updates.date = d.date;
//           if (d.time !== undefined) updates.time = d.time;
//           if (d.attendees !== undefined) updates.attendees = d.attendees;
//           if (d.topicsDiscussed !== undefined) updates.topicsDiscussed = d.topicsDiscussed;
//           if (d.notes !== undefined) updates.topicsDiscussed = d.notes;
//           if (d.sentiment !== undefined) updates.sentiment = d.sentiment;
//           if (d.outcomes !== undefined) updates.outcomes = d.outcomes;
//           if (d.followUpActions !== undefined) updates.followUpActions = d.followUpActions;
//           dispatch(setFormData(updates));

//         } else if (data.tool === 'clear_form') {
//           dispatch(clearForm());

//         } else if (data.tool === 'summarize_interaction') {
//           dispatch(setFormData({
//             topicsDiscussed: d.topicsDiscussed || d.notes || '',
//           }));

//         } else if (data.tool === 'suggest_followup') {
//           const suggestions = d.aiSuggestedFollowUps || d.suggestions || d.followUp || '';
//           const suggestionsArray = Array.isArray(suggestions)
//             ? suggestions
//             : suggestions.split('\n').filter(s => s.trim());
//           dispatch(setFormData({ aiSuggestedFollowUps: suggestionsArray }));
//         }

//         dispatch(addMessage({ type: 'agent', text: `Tool used: ${data.tool}`, data: data.data }));
//       } else {
//         dispatch(addMessage({ type: 'agent', text: 'Could not process request.' }));
//       }
//     } catch (error) {
//       console.error(error);
//       dispatch(addMessage({ type: 'agent', text: 'Server error.' }));
//     } finally {
//       dispatch(setChatLoading(false));
//     }
//   };

//   const handleFormSubmit = async () => {
//     dispatch(setFormLoading(true));
//     try {
//       const payload = {
//         hcpName: formData.hcpName,
//         interactionType: formData.interactionType,
//         dateTime: `${formData.date}T${formData.time}`,
//         notes: formData.topicsDiscussed,
//         outcome: formData.sentiment,
//         followUp: formData.followUpActions,
//       };

//       const response = await fetch('http://127.0.0.1:8000/interactions', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify(payload),
//       });

//       if (response.ok) {
//         alert('Interaction logged successfully!');
//       } else {
//         alert('Error logging interaction');
//       }
//     } catch (error) {
//       alert('Server error!');
//     } finally {
//       dispatch(setFormLoading(false));
//     }
//   };

//   return (
//     <div className="app-wrapper">
//       <div className="main-layout">

//         {/* LEFT PANEL */}
//         <div className="left-panel">
//           <div className="panel-header">
//             <h2>Log HCP Interaction</h2>
//           </div>

//           <div className="form-section">
//             <div className="section-title">Interaction Details</div>

//             <div className="form-row two-col">
//               <div className="form-group">
//                 <label>HCP Name</label>
//                 <input
//                   type="text"
//                   placeholder="Search or select HCP..."
//                   value={formData.hcpName}
//                   readOnly
//                   className="form-input"
//                 />
//               </div>
//               <div className="form-group">
//                 <label>Interaction Type</label>
//                 <div className="select-wrapper">
//                   <select value={formData.interactionType} disabled className="form-select">
//                     <option>Meeting</option>
//                     <option>Call</option>
//                     <option>Email</option>
//                     <option>Conference</option>
//                   </select>
//                 </div>
//               </div>
//             </div>

//             <div className="form-row two-col">
//               <div className="form-group">
//                 <label>Date</label>
//                 <input
//                   type="date"
//                   value={formData.date}
//                   readOnly
//                   className="form-input"
//                 />
//               </div>
//               <div className="form-group">
//                 <label>Time</label>
//                 <input
//                   type="time"
//                   value={formData.time}
//                   readOnly
//                   className="form-input"
//                 />
//               </div>
//             </div>

//             <div className="form-group">
//               <label>Attendees</label>
//               <input
//                 type="text"
//                 placeholder="Enter names or search..."
//                 value={formData.attendees}
//                 readOnly
//                 className="form-input"
//               />
//             </div>

//             <div className="form-group">
//               <label>Topics Discussed</label>
//               <textarea
//                 placeholder="Enter key discussion points..."
//                 value={formData.topicsDiscussed}
//                 readOnly
//                 className="form-textarea"
//                 rows={3}
//               />
//               <button className="voice-btn">
//                 🎙 Summarize from Voice Note (Requires Consent)
//               </button>
//             </div>

//             <div className="form-group">
//               <label>Materials Shared / Samples Distributed</label>
//               <div className="materials-section">
//                 <div className="materials-header">
//                   <span>Materials Shared</span>
//                   <button className="add-btn">🔍 Search/Add</button>
//                 </div>
//                 <div className="materials-list">
//                   {formData.materialsShared.length === 0
//                     ? <span className="empty-text">No materials added</span>
//                     : formData.materialsShared.map((m, i) => <div key={i} className="material-tag">{m}</div>)
//                   }
//                 </div>
//               </div>
//               <div className="materials-section" style={{ marginTop: '8px' }}>
//                 <div className="materials-header">
//                   <span>Samples Distributed</span>
//                   <button className="add-btn">+ Add Sample</button>
//                 </div>
//                 <div className="materials-list">
//                   {formData.samplesDistributed.length === 0
//                     ? <span className="empty-text">No samples added</span>
//                     : formData.samplesDistributed.map((s, i) => <div key={i} className="material-tag">{s}</div>)
//                   }
//                 </div>
//               </div>
//             </div>

//             <div className="form-group">
//               <label>Observed/Inferred HCP Sentiment</label>
//               <div className="sentiment-group">
//                 {['Positive', 'Neutral', 'Negative'].map(s => (
//                   <label key={s} className="radio-label">
//                     <input
//                       type="radio"
//                       name="sentiment"
//                       value={s}
//                       checked={formData.sentiment === s}
//                       readOnly
//                     />
//                     <span className={`radio-text ${formData.sentiment === s ? 'active' : ''}`}>{s}</span>
//                   </label>
//                 ))}
//               </div>
//             </div>

//             <div className="form-group">
//               <label>Outcomes</label>
//               <textarea
//                 placeholder="Key outcomes or agreements..."
//                 value={formData.outcomes}
//                 readOnly
//                 className="form-textarea"
//                 rows={2}
//               />
//             </div>

//             <div className="form-group">
//               <label>Follow-up Actions</label>
//               <textarea
//                 placeholder="Enter next steps or tasks..."
//                 value={formData.followUpActions}
//                 readOnly
//                 className="form-textarea"
//                 rows={2}
//               />
//             </div>

//             {formData.aiSuggestedFollowUps.length > 0 && (
//               <div className="form-group">
//                 <label>AI Suggested Follow-ups</label>
//                 <ul className="suggestions-list">
//                   {formData.aiSuggestedFollowUps.map((s, i) => (
//                     <li key={i} className="suggestion-item">📌 {s}</li>
//                   ))}
//                 </ul>
//               </div>
//             )}

//             <button
//               className="submit-btn"
//               onClick={handleFormSubmit}
//               disabled={formLoading}
//             >
//               {formLoading ? 'Logging...' : 'Log Interaction'}
//             </button>
//           </div>
//         </div>

//         {/* RIGHT PANEL */}
//         <div className="right-panel">
//           <div className="panel-header ai-header">
//             <span className="ai-icon">🤖</span>
//             <div>
//               <h2>AI Assistant</h2>
//               <p className="ai-subtitle">Log interaction via chat</p>
//             </div>
//           </div>

//           <div className="chat-history">
//             {chatHistory.length === 0 && (
//               <div className="chat-placeholder">
//                 <p>Log interaction details here (e.g., "Met Dr. Smith, discussed Product X efficacy, positive sentiment, shared brochure") or ask for help.</p>
//               </div>
//             )}
//             {chatHistory.map((msg, index) => (
//               <div key={index} className={`message ${msg.type}`}>
//                 <strong>{msg.type === 'user' ? 'You:' : 'AI:'}</strong> {msg.text}
//                 {msg.data && <pre className="data-pre">{JSON.stringify(msg.data, null, 2)}</pre>}
//               </div>
//             ))}
//             {chatLoading && (
//               <div className="message agent loading-msg">
//                 <span>AI is thinking...</span>
//               </div>
//             )}
//           </div>

//           <div className="chat-input-row">
//             <input
//               className="chat-input"
//               value={chatMessage}
//               onChange={(e) => dispatch(setCurrentMessage(e.target.value))}
//               placeholder="Describe interaction..."
//               onKeyDown={(e) => e.key === 'Enter' && handleAgentSubmit()}
//             />
//             <button
//               className="log-btn"
//               onClick={handleAgentSubmit}
//               disabled={chatLoading}
//             >
//               {chatLoading ? '...' : '📋 Log'}
//             </button>
//           </div>
//         </div>

//       </div>
//     </div>
//   );
// }

// export default App;
import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { setFormData, clearForm, setLoading as setFormLoading } from './formSlice';
import { addMessage, setLoading as setChatLoading, setCurrentMessage } from './chatSlice';
import './App.css';

function App() {
  const dispatch = useDispatch();
  const formData = useSelector((state) => state.form);
  const { messages: chatHistory, loading: chatLoading, currentMessage: chatMessage } = useSelector((state) => state.chat);
  const formLoading = useSelector((state) => state.form.loading);

  const handleAgentSubmit = async () => {
    if (!chatMessage.trim()) return;

    const userMessage = chatMessage;
    dispatch(addMessage({ type: 'user', text: userMessage }));
    dispatch(setCurrentMessage(''));
    dispatch(setChatLoading(true));

    try {
      const response = await fetch('http://127.0.0.1:8000/agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input: userMessage }),
      });

      const data = await response.json();

      if (response.ok && data.tool && data.data) {
        const d = data.data;

        if (data.tool === 'log_interaction') {
          dispatch(setFormData({
            hcpName: d.hcpName || d.hcp_name || '',
            interactionType: d.interactionType || 'Meeting',
            date: d.date || new Date().toISOString().split('T')[0],
            time: d.time || new Date().toTimeString().slice(0, 5),
            attendees: d.attendees || '',
            topicsDiscussed: d.topicsDiscussed || d.notes || '',
            materialsShared: d.materialsShared || [],
            samplesDistributed: d.samplesDistributed || [],
            sentiment: d.sentiment || 'Neutral',
            outcomes: d.outcomes || '',
            followUpActions: d.followUpActions || '',
            aiSuggestedFollowUps: d.aiSuggestedFollowUps || [],
          }));

        } else if (data.tool === 'edit_interaction') {
          const updates = {};
          if (d.hcpName !== undefined) updates.hcpName = d.hcpName;
          if (d.interactionType !== undefined) updates.interactionType = d.interactionType;
          if (d.date !== undefined) updates.date = d.date;
          if (d.time !== undefined) updates.time = d.time;
          if (d.attendees !== undefined) updates.attendees = d.attendees;
          if (d.topicsDiscussed !== undefined) updates.topicsDiscussed = d.topicsDiscussed;
          if (d.notes !== undefined) updates.topicsDiscussed = d.notes;
          if (d.sentiment !== undefined) updates.sentiment = d.sentiment;
          if (d.outcomes !== undefined) updates.outcomes = d.outcomes;
          if (d.followUpActions !== undefined) updates.followUpActions = d.followUpActions;
          dispatch(setFormData(updates));

        } else if (data.tool === 'clear_form') {
          dispatch(clearForm());

        } else if (data.tool === 'summarize_interaction') {
          dispatch(setFormData({
            topicsDiscussed: d.topicsDiscussed || d.notes || '',
          }));

        } else if (data.tool === 'suggest_followup') {
          const suggestions = d.aiSuggestedFollowUps || d.suggestions || d.followUp || '';
          const suggestionsArray = Array.isArray(suggestions)
            ? suggestions
            : suggestions.split('\n').filter(s => s.trim());
          dispatch(setFormData({ aiSuggestedFollowUps: suggestionsArray }));
        }

        dispatch(addMessage({ type: 'agent', text: `Tool used: ${data.tool}`, data: data.data }));
      } else {
        dispatch(addMessage({ type: 'agent', text: 'Could not process request.' }));
      }
    } catch (error) {
      console.error(error);
      dispatch(addMessage({ type: 'agent', text: 'Server error.' }));
    } finally {
      dispatch(setChatLoading(false));
    }
  };

  const handleFormSubmit = async () => {
    dispatch(setFormLoading(true));
    try {
      const payload = {
        hcpName: formData.hcpName,
        interactionType: formData.interactionType,
        dateTime: `${formData.date}T${formData.time}`,
        notes: formData.topicsDiscussed,
        outcome: formData.sentiment,
        followUp: formData.followUpActions,
      };

      const response = await fetch('http://127.0.0.1:8000/interactions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        alert('Interaction logged successfully!');
      } else {
        alert('Error logging interaction');
      }
    } catch (error) {
      alert('Server error!');
    } finally {
      dispatch(setFormLoading(false));
    }
  };

  return (
    <div className="app-wrapper">
      <div className="main-layout">

        {/* LEFT PANEL */}
        <div className="left-panel">
          <div className="panel-header">
            <h2>Log HCP Interaction</h2>
          </div>

          <div className="form-section">
            <div className="section-title">Interaction Details</div>

            <div className="form-row two-col">
              <div className="form-group">
                <label>HCP Name</label>
                <input
                  type="text"
                  placeholder="Search or select HCP..."
                  value={formData.hcpName}
                  readOnly
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label>Interaction Type</label>
                <div className="select-wrapper">
                  <select value={formData.interactionType} disabled className="form-select">
                    <option>Meeting</option>
                    <option>Call</option>
                    <option>Email</option>
                    <option>Conference</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="form-row two-col">
              <div className="form-group">
                <label>Date</label>
                <input
                  type="date"
                  value={formData.date}
                  readOnly
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label>Time</label>
                <input
                  type="time"
                  value={formData.time}
                  readOnly
                  className="form-input"
                />
              </div>
            </div>

            <div className="form-group">
              <label>Attendees</label>
              <input
                type="text"
                placeholder="Enter names or search..."
                value={formData.attendees}
                readOnly
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label>Topics Discussed</label>
              <textarea
                placeholder="Enter key discussion points..."
                value={formData.topicsDiscussed}
                readOnly
                className="form-textarea"
                rows={3}
              />
              <button className="voice-btn">
                🎙 Summarize from Voice Note (Requires Consent)
              </button>
            </div>

            <div className="form-group">
              <label>Materials Shared / Samples Distributed</label>
              <div className="materials-section">
                <div className="materials-header">
                  <span>Materials Shared</span>
                  <button className="add-btn">🔍 Search/Add</button>
                </div>
                <div className="materials-list">
                  {formData.materialsShared.length === 0
                    ? <span className="empty-text">No materials added</span>
                    : formData.materialsShared.map((m, i) => <div key={i} className="material-tag">{m}</div>)
                  }
                </div>
              </div>
              <div className="materials-section" style={{ marginTop: '8px' }}>
                <div className="materials-header">
                  <span>Samples Distributed</span>
                  <button className="add-btn">+ Add Sample</button>
                </div>
                <div className="materials-list">
                  {formData.samplesDistributed.length === 0
                    ? <span className="empty-text">No samples added</span>
                    : formData.samplesDistributed.map((s, i) => <div key={i} className="material-tag">{s}</div>)
                  }
                </div>
              </div>
            </div>

            <div className="form-group">
              <label>Observed/Inferred HCP Sentiment</label>
              <div className="sentiment-group">
                {['Positive', 'Neutral', 'Negative'].map(s => (
                  <label key={s} className="radio-label">
                    <input
                      type="radio"
                      name="sentiment"
                      value={s}
                      checked={formData.sentiment === s}
                      readOnly
                    />
                    <span className={`radio-text ${formData.sentiment === s ? 'active' : ''}`}>{s}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label>Outcomes</label>
              <textarea
                placeholder="Key outcomes or agreements..."
                value={formData.outcomes}
                readOnly
                className="form-textarea"
                rows={2}
              />
            </div>

            <div className="form-group">
              <label>Follow-up Actions</label>
              <textarea
                placeholder="Enter next steps or tasks..."
                value={formData.followUpActions}
                readOnly
                className="form-textarea"
                rows={2}
              />
            </div>

            {formData.aiSuggestedFollowUps.length > 0 && (
              <div className="form-group">
                <label>AI Suggested Follow-ups</label>
                <ul className="suggestions-list">
                  {formData.aiSuggestedFollowUps.map((s, i) => (
                    <li key={i} className="suggestion-item">📌 {s}</li>
                  ))}
                </ul>
              </div>
            )}

            <button
              className="submit-btn"
              onClick={handleFormSubmit}
              disabled={formLoading}
            >
              {formLoading ? 'Logging...' : 'Log Interaction'}
            </button>
          </div>
        </div>

        {/* RIGHT PANEL */}
        <div className="right-panel">
          <div className="panel-header ai-header">
            <span className="ai-icon">🤖</span>
            <div>
              <h2>AI Assistant</h2>
              <p className="ai-subtitle">Log interaction via chat</p>
            </div>
          </div>

          <div className="chat-history">
            {chatHistory.length === 0 && (
              <div className="chat-placeholder">
                <p>Log interaction details here (e.g., "Met Dr. Smith, discussed Product X efficacy, positive sentiment, shared brochure") or ask for help.</p>
              </div>
            )}
            {chatHistory.map((msg, index) => (
              <div key={index} className={`message ${msg.type}`}>
                <strong>{msg.type === 'user' ? 'You:' : 'AI:'}</strong> {msg.text}
                {msg.data && <pre className="data-pre">{JSON.stringify(msg.data, null, 2)}</pre>}
              </div>
            ))}
            {chatLoading && (
              <div className="message agent loading-msg">
                <span>AI is thinking...</span>
              </div>
            )}
          </div>

          <div className="chat-input-row">
            <input
              className="chat-input"
              value={chatMessage}
              onChange={(e) => dispatch(setCurrentMessage(e.target.value))}
              placeholder="Describe interaction..."
              onKeyDown={(e) => e.key === 'Enter' && handleAgentSubmit()}
            />
            <button
              className="log-btn"
              onClick={handleAgentSubmit}
              disabled={chatLoading}
            >
              {chatLoading ? '...' : '📋 Log'}
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}

export default App;