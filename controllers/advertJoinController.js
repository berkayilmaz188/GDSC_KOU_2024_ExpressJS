const Advert = require('../models/advertModel'); // Modelin yolu projenize göre değişiklik gösterebilir
const User = require('../models/userModel');

exports.joinAdvert = async (req, res) => {
    const { advertId } = req.params;
    const userId = req.user.id;
  
    const advert = await Advert.findById(advertId);
    if (!advert) {
      return res.status(404).json({ success: false, message: "Advert not found." });
    }

    if (advert.status !== 'active') {
        return res.status(403).json({ success: false, message: "This advert is not active." });
      }
  
    const user = await User.findById(userId);
    if (user.points < advert.point) {
      return res.status(400).json({ success: false, message: "Not enough points." });
    }
  
    user.actionsHistory.push({
        type: 'joinedAdvert',
        advertId: advertId
      });
      
    user.actionsHistory = user.actionsHistory.slice(-5);
    // Kullanıcıyı ilana katılımcı olarak ekle
    if (!advert.participants.includes(userId)) {
      advert.participants.push(userId);
      user.points -= advert.point; // Puanı düşür
      user.participatedAdverts.push(advertId); // Katıldığı ilanlara ekle
      await advert.save();
      await user.save();
    }
    
  
    res.status(200).json({ success: true, message: "Successfully joined the advert." });
  };

  
  exports.performDraw = async (req, res) => {
    const { advertId } = req.params;

    const advert = await Advert.findById(advertId);
    if (!advert) {
      return res.status(404).json({ success: false, message: "Advert not found." });
    }
  
    // İlan sahibi kontrolü
    if (advert.owner.toString() !== req.user.id.toString()) {
      return res.status(403).json({ success: false, message: "You are not the owner of this advert." });
    }

    if (advert.drawCompleted) {
      return res.status(400).json({ success: false, message: "Draw already completed." });
    }
  
    if (advert.participants.length < advert.minParticipants) {
      return res.status(400).json({ success: false, message: "Not enough participants." });
    }
  
    // Rastgele bir kazanan seç
    const winnerIndex = Math.floor(Math.random() * advert.participants.length);
    const winnerId = advert.participants[winnerIndex];
  
    // Kazananı ve ilanı güncelle
    const winner = await User.findById(winnerId);
    winner.wonAdverts.push(advertId);

    advert.winnerId = winnerId;
    advert.winnerUsername = winner.username; // Kazananı ilanın winner alanına kaydet
    advert.drawCompleted = true;
    advert.status = 'completed';
    await winner.save();
    await advert.save();

    // İlanın durumunu ve çekiliş tamamlanma durumunu güncelle
    advert.drawCompleted = true;
    advert.status = 'completed'; // İlanın durumunu 'completed' olarak güncelle
    advert.lostParticipants = advert.participants.filter(participantId => participantId.toString() !== winnerId.toString());
    await advert.save();
  
    // Diğer katılımcılara puan iadesi ve kaybeden ilanların güncellenmesi
    advert.participants.forEach(async participantId => {
        if (participantId.toString() !== winnerId.toString()) {
          const participant = await User.findById(participantId);
          participant.points += advert.point; // Puan iadesi
          participant.lostAdverts.push(advertId); // Kaybedilen ilanlar listesine ekle
          await participant.save();
        }
      });

    // İlan sahibine puan ekleme
    const owner = await User.findById(req.user.id);
    owner.points += advert.point;
    await owner.save();
  
    res.status(200).json({ success: true, message: "Draw completed.", winner: winner.username });
};

exports.withdrawFromAdvert = async (req, res) => {
    const { advertId } = req.params;
    const userId = req.user.id;
  
    try {
        const advert = await Advert.findById(advertId);
        if (!advert) {
            return res.status(404).json({ success: false, message: "Advert not found." });
        }

        if (advert.drawCompleted) {
            return res.status(400).json({ success: false, message: "Cannot withdraw from a completed draw." });
        }

        const isParticipant = advert.participants.includes(userId);
        if (!isParticipant) {
            return res.status(400).json({ success: false, message: "You are not a participant of this advert." });
        }

        // Kullanıcıyı çekiliş katılımcıları listesinden çıkar
        advert.participants = advert.participants.filter(participantId => participantId.toString() !== userId);
        await advert.save();

        const user = await User.findById(userId);
        user.points += advert.point; // Katılım için düşürülen puanı geri ekle

        // Kullanıcının katıldığı ilanlardan çekilişi geri al
        user.participatedAdverts = user.participatedAdverts.filter(participatedAdvertId => participatedAdvertId.toString() !== advertId);

        user.actionsHistory.push({
            type: 'withdrawnAdvert',
            advertId: advertId
        });
        user.actionsHistory = user.actionsHistory.slice(-5); // En son 5 işlemi tut
        await user.save();

        res.status(200).json({ success: true, message: "Successfully withdrawn from the advert." });
    } catch (error) {
        console.error("Error withdrawing from advert:", error);
        res.status(500).json({ success: false, message: "Server error", error: error.message });
    }
};







