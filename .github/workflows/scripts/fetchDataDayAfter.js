(async () => {
    const fetch = await import('node-fetch').then(module => module.default);
  
    const res = await fetch(`https://rencontres.territoiresentransitions.fr/api/workflow/workflowAfter`, {
      method: 'GET'
    });
    const data = await res.json();
    console.log(data);
  })();
  