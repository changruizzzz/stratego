package com.white.stratego.stratego.market.model;
import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;
import javax.persistence.*;
import java.util.Date;
import java.util.Set;


@Entity
@Table(name = "unit")
public abstract class MarketUnit {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "userId", nullable = false)
    @OnDelete(action = OnDeleteAction.CASCADE)
    private User createdBy;

//    @Temporal(TemporalType.TIMESTAMP)
//    private Date creationDateTime;

    @ManyToMany(mappedBy = "saved_units")
    private Set<User> savedBy;

    private boolean if_public;

    public User getCreatedBy() {
        return createdBy;
    }

    public void setCreatedBy(User createdBy) {
        this.createdBy = createdBy;
    }

    public Set<User> getSavedBy() {
        return savedBy;
    }

    public void setSavedBy(Set<User> savedBy) {
        this.savedBy = savedBy;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Set<User> getSaved_by() {
        return savedBy;
    }

    public void setSaved_by(Set<User> saved_by) {
        this.savedBy = saved_by;
    }

    public boolean isIf_public() {
        return if_public;
    }

    public void setIf_public(boolean if_public) {
        this.if_public = if_public;
    }

//    public Date getCreationDateTime() {
//        return creationDateTime;
//    }
//
//    public void setCreationDateTime(Date creationDateTime) {
//        this.creationDateTime = creationDateTime;
//    }
}
