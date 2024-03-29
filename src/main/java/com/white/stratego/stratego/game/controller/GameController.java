package com.white.stratego.stratego.game.controller;

import com.white.stratego.stratego.game.Model.Game;
import com.white.stratego.stratego.game.Model.Movement;
import com.white.stratego.stratego.game.Model.Statistics;
import com.white.stratego.stratego.game.Model.MoveResponse;
import com.white.stratego.stratego.game.repository.StatisticsRepository;
import com.white.stratego.stratego.game.service.GameService;
import com.white.stratego.stratego.market.model.User;
import com.white.stratego.stratego.market.service.UserServiceImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@Controller
public class GameController {

    @Autowired
    private StatisticsRepository statisticsRepository;

    @Autowired
    private UserServiceImpl userService;

    @Autowired
    private GameService gameService;


    @RequestMapping("/create")
    public String newGame(Authentication authentication) {

        Game g = gameService.newGame(userService.findByAuthentication(authentication));

        return "redirect:/game/" + g.getId();
    }

    @RequestMapping("/delete/{id}")
    public String newGame(@PathVariable long id) {
        gameService.deleteById(id);

        return "redirect:/dashboard";
    }

    @GetMapping({"/"})
    public String index(Authentication authentication) {
        if(authentication != null && authentication.isAuthenticated())
            return "redirect:/dashboard";
        return "index";
    }

    @RequestMapping({"/dashboard"})
    public String dashboard(Authentication authentication, Model model) {

        User user = userService.findByAuthentication(authentication);
        if(!user.getIsActive())
            return "redirect:/verify";
        List<Game> games = gameService.findByCreatedBy(user);
        games.sort(((o1, o2) -> Long.compare(o2.getId(), o1.getId())));
        Statistics stats = statisticsRepository.findByUser(user);
        if(stats == null) {
            stats = new Statistics();
            stats.setUser(user);
            statisticsRepository.save(stats);
        }
        model.addAttribute("games", games);
        model.addAttribute("user", user);
        model.addAttribute("stats", statisticsRepository.findByUser(user));
        return "dashboard";
    }

    @PostMapping("/game/{id}/swap")
    @ResponseBody
    public Object setupSwap(@PathVariable long id, @RequestParam int x1, @RequestParam int y1,
                                @RequestParam int x2, @RequestParam int y2) {
        gameService.processSetupSwap(id, x1, y1, x2, y2);
        return null;
    }

    @PostMapping("/game/{id}/start")
    @ResponseBody
    public Object setupSwap(@PathVariable long id) {
        gameService.start(id);
        return null;
    }

    @PostMapping("/game/{id}/surrender")
    @ResponseBody
    public Object surrender(@PathVariable long id) {
        gameService.surrender(id);
        return null;
    }

    @PostMapping("/game/{id}/processMove")
    @ResponseBody
    public MoveResponse processMove(@PathVariable long id, @RequestParam int x1, @RequestParam int y1,
                                    @RequestParam int x2, @RequestParam int y2) {

        return gameService.processMove(id, new Movement(x1, y1, x2, y2));

    }

    @PostMapping("/game/{id}/askMove")
    @ResponseBody
    public MoveResponse askMove(@PathVariable long id, @RequestParam char side) {
        return gameService.processMove(id, gameService.askMove(id, side));

    }

    @PostMapping("/game/{id}/playAgain")
    @ResponseBody
    public long playAgain(@PathVariable long id, Authentication authentication) {
        return gameService.playAgain(id, userService.findByAuthentication(authentication));

    }

    @RequestMapping("/game/{id}")
    public String game(@PathVariable long id, Model model, Authentication authentication) {
        Game game = gameService.findById(id);
        User user = userService.findByAuthentication(authentication);
        if(!user.equals(game.getCreatedBy())) {
            return "redirect:/dashboard";
        }
        model.addAttribute("game", game);
        return "game";
    }

}
