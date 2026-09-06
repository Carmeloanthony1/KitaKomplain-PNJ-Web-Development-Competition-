// --- FUNGSI SHARE PROFILE (BY USER_ID) ---
  const share_profile = async (username, userId) => {
    // Ubah di baris ini: langsung pakai userId
    const shareUrl = `${window.location.origin}/profile/${userId}`; 
    
    const shareData = {
      title: `Profile KitaKomplain - ${username}`,
      text: `Cek profile dan riwayat aduan ${username} di platform KitaKomplain!`,
      url: shareUrl,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
        console.log('Profil berhasil dibagikan!');
      } catch (err) {
        console.log('Share dibatalkan', err);
      }
    } else { 
      try {
        await navigator.clipboard.writeText(shareUrl);
        showStatus("Link profil berhasil disalin ke clipboard!", "success");
      } catch (err) {
        console.error('Gagal menyalin link :', err);
        showStatus("Gagal menyalin link profil!", "error");
      }
    }
  };