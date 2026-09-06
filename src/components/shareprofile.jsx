// --- FUNGSI SHARE PROFILE (BY USER_ID / UUID) ---
  const share_profile = async () => {
    // Ambil ID dari props user atau dari localStorage
    const targetUserId = user?.id || localStorage.getItem("user_id");

    if (!targetUserId) {
      showStatus("Gagal mendapatkan User ID!", "error");
      return;
    }

    // Pakai targetUserId (UUID)
    const shareUrl = `${window.location.origin}/profile/${targetUserId}`; 
    
    const shareData = {
      title: `Profile KitaKomplain - ${username}`,
      text: `Cek profile dan riwayat aduan ${username} di platform KitaKomplain!`,
      url: shareUrl,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
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