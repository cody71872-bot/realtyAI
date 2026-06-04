const leads = [];
const visitors = [];
const contentItems = [];

function addLead(data) { leads.push({ ...data, timestamp: new Date().toISOString() }); }
function addVisitor(data) { visitors.push({ ...data, timestamp: new Date().toISOString() }); }
function addContent(data) { contentItems.push({ ...data, timestamp: new Date().toISOString() }); }
function getLeads() { return [...leads].reverse(); }
function getVisitors() { return [...visitors].reverse(); }
function getContent() { return [...contentItems].reverse(); }

module.exports = { addLead, addVisitor, addContent, getLeads, getVisitors, getContent };
